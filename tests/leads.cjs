const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const handler = require('../api/leads.js');
const lead = () => ({requestId:randomUUID(),name:'Teste técnico',phone:'(47) 99123-1111',email:'teste@example.test',service:'INSS de obra / CNO / CND',city:'Balneário Camboriú, SC',source:'Google',situation:'Teste de integração',website:'',attribution:{landingPage:'https://www.engenhariaduarte.com.br/inss-de-obra/',firstSource:'Google',lastSource:'Google',utmSource:'google',utmMedium:'cpc',utmTerm:'inss de obra'}});
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(s){this.code=s;return this},json(b){this.body=b;return this}}}
async function call(body,extra={}){const res=response();await handler({method:'POST',headers:{origin:'https://www.engenhariaduarte.com.br','content-type':'application/json'},body,...extra},res);return res;}
(async()=>{
  assert(handler.parseLead(lead()));
  assert.equal(handler.parseLead({...lead(),phone:'123'}),null);
  assert.equal(handler.parseLead({...lead(),name:' '}),null);
  assert.equal(handler.parseLead({...lead(),email:'invalid'}),null);
  assert.equal(handler.parseLead({...lead(),admin:true}),null);
  assert.equal(handler.parseLead({...lead(),attribution:{landingPage:'https://evil.test/'}}),null);
  assert.equal(handler.parseLead({...lead(),attribution:{landingPage:'https://www.engenhariaduarte.com.br/?email=x'}}),null);
  assert.equal((await call(lead(),{method:'GET'})).code,405);
  assert.equal((await call(lead(),{headers:{origin:'https://evil.test','content-type':'application/json'}})).code,403);
  assert.equal((await call({...lead(),website:'spam'})).code,400);
  assert.equal((await call(lead())).code,503);
  process.env.DUARTE_CRM_URL='https://duarte-engenharia-gestao.lovelygull6.chatgpt.site';
  process.env.DUARTE_CRM_SERVICE_TOKEN='test-only';process.env.DUARTE_LEAD_HMAC_SECRET='test-only';
  const original=global.fetch;let forwarded;
  global.fetch=async (url,opts)=>{forwarded={url,opts};return {ok:true,status:200,json:async()=>({ok:true,receipt:'saved-record'})}};
  const result=await call(lead());assert.equal(result.code,200);assert.equal(result.body.receipt,'saved-record');
  assert.equal(forwarded.url,process.env.DUARTE_CRM_URL+'/api/leads');assert(!('website' in JSON.parse(forwarded.opts.body)));assert.equal(forwarded.opts.redirect,'error');assert.equal(forwarded.opts.headers['x-duarte-signature'].length,64);
  assert.equal(JSON.parse(forwarded.opts.body).attribution.utmTerm,'inss de obra');
  global.fetch=async()=>({ok:false,status:503,json:async()=>({error:'failed'})});assert.equal((await call(lead())).code,503);
  global.fetch=async()=>{throw Error('timeout')};assert.equal((await call(lead())).code,503);
  global.fetch=original;console.log('PASS: relay validation, origin protection, missing config, signed forwarding, CRM failure and success acknowledgement.');
})().catch(error=>{console.error(error);process.exitCode=1});
