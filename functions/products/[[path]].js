const WORKER_URL="https://digift-manager.qasimm2012.workers.dev/api/catalog";

function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
function imageOf(p){const a=Array.isArray(p.images)?p.images:[];return a.find(x=>x.url_fullxfull)?.url_fullxfull||a.find(x=>x.url_570xN)?.url_570xN||a.find(x=>x.url_170x135)?.url_170x135||""}
function money(v,c="USD"){const n=v&&typeof v==="object"?Number(v.amount||0)/Math.pow(10,Number(v.divisor||2)):Number(v||0);try{return new Intl.NumberFormat("en-US",{style:"currency",currency:c}).format(n)}catch{return n.toFixed(2)}}
function slug(t,id){return String(t||"product").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||String(id)}
function videoOf(p){const v=Array.isArray(p.videos)?p.videos.filter(x=>x.is_active!==false):[];return v[0]||null}
function page(p,origin){
 const img=imageOf(p), video=videoOf(p), title=esc(p.title), description=esc(String(p.description||"").replace(/\s+/g," ").slice(0,300));
 const url=origin+"/products/"+p.listing_id+"/"+slug(p.title,p.listing_id)+"/";
 const images=(p.images||[]).map(x=>x.url_fullxfull||x.url_570xN).filter(Boolean);
 const jsonld=JSON.stringify({"@context":"https://schema.org","@type":"Product","name":p.title,"description":String(p.description||"")||"","image":images,"url":url,"offers":{"@type":"Offer","url":url,"priceCurrency":p.currency_code||"USD","price":p.price&&typeof p.price==="object"?Number(p.price.amount||0)/Math.pow(10,Number(p.price.divisor||2)):Number(p.price||0),"availability":"https://schema.org/InStock"}});
 const gallery=(p.images||[]).map((x,i)=>{const u=x.url_fullxfull||x.url_570xN;return u?'<img src="'+esc(u)+'" alt="'+title+' — image '+(i+1)+'" loading="'+(i?"lazy":"eager")+'">':""}).join("");
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' | Digift Studio</title><meta name="description" content="'+description+'"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="icon" href="/assets/digift-logo-transparent.png" type="image/png"><link rel="stylesheet" href="/styles.css"><script type="application/ld+json">'+jsonld.replace(/</g,"\\u003c")+'</script></head><body><header class="site-header"><a class="brand brand-logo" href="/"><img src="/assets/digift-logo-transparent.png" alt="Digift Studio" width="132" height="132"></a><nav class="desktop-nav"><a href="/shop/">Shop</a><a href="/#collections">Collections</a><a href="/#how-it-works">How It Works</a></nav><details class="mobile-nav"><summary>Menu</summary><div class="mobile-nav-panel"><a href="/shop/">Shop</a><a href="/#collections">Collections</a><a href="/#how-it-works">How It Works</a></div></details></header><main><section class="product-detail"><div class="product-gallery">'+gallery+'</div><div class="product-detail-copy"><p class="eyebrow">DIGIFT STUDIO · DIGITAL PRODUCT</p><h1>'+title+'</h1><p class="product-price">'+money(p.price,p.currency_code)+'</p><div class="product-description">'+String(p.description||"").replace(/\n/g,"<br>")+'</div>'+(p.is_personalizable?'<div class="personalized-note"><strong>Personalized experience</strong><span>This Etsy product supports personalization. Your customization details are collected through Etsy.</span></div>':"")+'<a class="button" href="'+esc(p.url||"https://www.etsy.com/")+'" target="_blank" rel="noopener">Shop on Etsy →</a><a class="back-link" href="/shop/">← Back to Shop</a></div></section>'+(video?'<section class="product-video"><video controls playsinline preload="metadata" poster="'+esc(video.thumbnail_url||img)+'" src="'+esc(video.video_url||video.url||"")+'"></video></section>':"")+'</main><footer><div><a class="brand footer-logo" href="/"><img src="/assets/digift-logo-transparent.png" alt="Digift Studio" width="150" height="150"></a><p>Personalized digital experiences.</p></div><div class="footer-links"><a href="/shop/">Shop</a><a href="'+esc(p.url||"https://www.etsy.com/")+'" target="_blank" rel="noopener">Etsy Shop</a></div></footer></body></html>';
}
export async function onRequestGet(context){
 const parts=Array.isArray(context.params.path)?context.params.path:[]; const id=Number(parts[0]);
 if(!Number.isFinite(id))return new Response("Product not found",{status:404});
 try{
  const response=await fetch(WORKER_URL,{headers:{"Accept":"application/json"}});
  if(!response.ok)return new Response("Catalog unavailable",{status:502});
  const data=await response.json();
  const product=(data.products||[]).find(x=>Number(x.listing_id)===id);
  if(!product)return new Response("Product not found",{status:404});
  return new Response(page(product,new URL(context.request.url).origin),{headers:{"Content-Type":"text/html; charset=UTF-8","Cache-Control":"public, max-age=60, s-maxage=60"}});
 }catch{return new Response("Catalog unavailable",{status:502})}
}