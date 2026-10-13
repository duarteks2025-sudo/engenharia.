const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function field(value=''){return {value,valid:'',listeners:{},setCustomValidity(v){this.valid=v},addEventListener(k,v){this.listeners[k]=v}}}
const values={name:'Teste formulário',phone:'47991231111',email:'teste@example.test',city:'BC, SC',source:'Google',situation:'Preciso regularizar',personType:'Pessoa jurídica',area:'136.50',constructionType:'Residencial unifamiliar',start:'2020-01',end:'2021-01',cno:'Não existe',sero:'Não realizada',accounting:'Não sei',labor:'Não sei',payments:'Não sei',website:''};
async function setup(ok=true){
 const elements=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,field(v)]));const status={},fallback={},button={},diagnose={listeners:{},addEventListener(k,v){this.listeners[k]=v}};
 const diagnostic={hidden:true,children:[],replaceChildren(){this.children=[]},append(v){this.children.push(v)}};
 const form={elements,dataset:{service:'INSS de obra / CNO / CND'},listeners:{},resets:0,addEventListener(k,v){this.listeners[k]=v},reportValidity(){return Object.values(elements).every(x=>!x.valid)},querySelector(s){return {'[data-diagnose]':diagnose,'[data-status]':status,'button[type="submit"]':button,'[data-fallback]':fallback}[s]},reset(){this.resets++}};
 let sent;const document={referrer:'https://www.google.com/search?q=private',querySelectorAll:()=>[form],getElementById:()=>diagnostic,createElement:()=>({children:[],append(v){this.children.push(v)}})};
 const storage=new Map();const context={document,location:{origin:'https://www.engenhariaduarte.com.br',pathname:'/inss-de-obra/',search:'?utm_source=google&utm_medium=cpc&utm_term=inss+obra&email=ignored'},URL,URLSearchParams,Date,crypto:require('node:crypto').webcrypto,sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},FormData:class{constructor(f){this.values=f.elements}*[Symbol.iterator](){for(const [k,v] of Object.entries(this.values))yield[k,v.value]}},AbortSignal,fetch:async(u,o)=>{sent=JSON.parse(o.body);return {ok,json:async()=>({ok})}}};
 vm.runInNewContext(fs.readFileSync('assets/leads.js','utf8'),context);
 return {form,status,fallback,button,diagnostic,diagnose,get sent(){return sent}};
}
(async()=>{
 let s=await setup();s.diagnose.listeners.click();const text=JSON.stringify(s.diagnostic.children);assert(text.includes('Pessoa')===false);assert(text.includes('contador'));assert(text.includes('Não há cálculo'));
 await s.form.listeners.submit({preventDefault(){}});assert.equal(s.form.resets,1);assert.equal(s.sent.attribution.utmTerm,'inss obra');assert.equal(s.sent.attribution.referrer,'www.google.com');assert.equal(s.sent.attribution.landingPage,'https://www.engenhariaduarte.com.br/inss-de-obra/');assert(s.sent.situation.includes('Área (m²): 136.50'));assert.equal(s.button.disabled,false);assert(s.status.textContent.includes('recebida'));
 s=await setup(false);await s.form.listeners.submit({preventDefault(){}});assert.equal(s.form.resets,0);assert.equal(s.fallback.hidden,false);assert(s.fallback.href.startsWith('https://wa.me/5547991233830?text='));assert(s.status.textContent.includes('Não foi possível'));
 s=await setup();s.form.elements.end.value='2019-01';await s.form.listeners.submit({preventDefault(){}});assert.equal(s.sent,undefined);assert(s.form.elements.end.valid);
 s=await setup();s.form.elements.phone.value='123';await s.form.listeners.submit({preventDefault(){}});assert.equal(s.sent,undefined);assert(s.form.elements.phone.valid);
 console.log('PASS: form data, attribution without query string, PJ diagnostic, date/phone validation, confirmed success and retry/WhatsApp fallback.');
})().catch(e=>{console.error(e);process.exitCode=1});
