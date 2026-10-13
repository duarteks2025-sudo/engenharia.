const { createHmac } = require('node:crypto');
const SERVICES = ['Regularização de imóvel / Habite-se','INSS de obra / CNO / CND','Perícia ou laudo técnico','Averbação de construção','Retificação de área','Bombeiros (AVCB/CLCB)','Outro'];
const SOURCES = ['','Google','Bing','Instagram','Facebook','YouTube','Indicação','Outro'];
const CRM_ORIGIN = 'https://duarte-engenharia-gestao.lovelygull6.chatgpt.site';
function validText(v,min,max){return typeof v === 'string' && v.trim().length>=min && v.length<=max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);}
function parseLead(input) {
  if (!input || typeof input!=='object' || Array.isArray(input) || JSON.stringify(input).length > 10000) return null;
  const keys=['requestId','name','phone','email','service','city','source','situation','website','attribution'];
  if(Object.keys(input).some(key=>!keys.includes(key))) return null;
  if(!validText(input.requestId,36,36)||!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(input.requestId)||!validText(input.name,2,120)||!validText(input.phone,10,20)||!validText(input.city,2,100)||!SERVICES.includes(input.service)||!SOURCES.includes(input.source||'')||!validText(input.email||'',0,254)||!validText(input.situation||'',0,1500)||!validText(input.website||'',0,200)) return null;
  let phone=input.phone.replace(/\D/g,'');if(phone.startsWith('55')&&phone.length>11)phone=phone.slice(2);
  if(!/^[1-9]\d{9,10}$/.test(phone) || (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))) return null;
  const attribution=input.attribution||{};
  const attributionKeys=['landingPage','referrer','firstSource','lastSource','utmSource','utmMedium','utmCampaign','utmContent','utmTerm'];
  if(typeof attribution!=='object'||Array.isArray(attribution)||Object.keys(attribution).some(key=>!attributionKeys.includes(key)))return null;
  for(const [key,value] of Object.entries(attribution)) if(!validText(value,0,key==='landingPage'?500:160)) return null;
  if(attribution.landingPage){try{const url=new URL(attribution.landingPage);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!(url.hostname==='www.engenhariaduarte.com.br'||url.hostname==='engenhariaduarte.com.br'||url.hostname.endsWith('.vercel.app')))return null;}catch{return null;}}
  for(const key of ['firstSource','lastSource'])if(attribution[key]&&!['Desconhecida','Google','Bing','Instagram','Facebook','YouTube'].includes(attribution[key]))return null;
  return {requestId:input.requestId,name:input.name.trim(),phone,email:(input.email||'').trim().toLowerCase(),service:input.service,city:input.city.trim(),source:input.source||'',situation:(input.situation||'').trim(),attribution};
}
async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const reply=(status,body)=>res.status(status).json(body);
  if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,{error:'Método não permitido.'});}
  const permitted=new Set(['https://www.engenhariaduarte.com.br','https://engenhariaduarte.com.br']);
  if(process.env.VERCEL_URL)permitted.add('https://'+process.env.VERCEL_URL);
  if(process.env.VERCEL_BRANCH_URL)permitted.add('https://'+process.env.VERCEL_BRANCH_URL);
  if(!permitted.has(req.headers.origin))return reply(403,{error:'Origem não permitida.'});
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(415,{error:'Formato não permitido.'});
  let input=req.body;try{if(typeof input==='string')input=JSON.parse(input);}catch{return reply(400,{error:'Dados inválidos.'});}
  const lead=parseLead(input);if(!lead)return reply(400,{error:'Confira os dados do formulário.'});
  if(input.website)return reply(400,{error:'Confira os dados do formulário.'});
  const secret=process.env.DUARTE_LEAD_HMAC_SECRET,token=process.env.DUARTE_CRM_SERVICE_TOKEN;
  if(!secret||!token||process.env.DUARTE_CRM_URL!==CRM_ORIGIN)return reply(503,{error:'Recebimento indisponível. Use o WhatsApp.'});
  const raw=JSON.stringify(lead),timestamp=String(Date.now()),signature=createHmac('sha256',secret).update(timestamp+'.'+raw).digest('hex');
  try{
    const upstream=await fetch(CRM_ORIGIN+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json','OAI-Sites-Authorization':'Bearer '+token,'x-duarte-timestamp':timestamp,'x-duarte-signature':signature},body:raw,redirect:'error',signal:AbortSignal.timeout(10000)});
    const saved=await upstream.json();
    if(!upstream.ok||saved.ok!==true)return reply(upstream.status===409?409:503,{error:'Não foi possível confirmar o recebimento. Use o WhatsApp.'});
    return reply(200,{ok:true,receipt:saved.receipt});
  }catch{return reply(503,{error:'Não foi possível confirmar o recebimento. Use o WhatsApp.'});}
}
module.exports=handler;
module.exports.parseLead=parseLead;
