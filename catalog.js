const DIGIFT_CATALOG_API="/api/catalog";
const DIGIFT_MANAGER_CATALOG_API="https://digift-manager.qasimm2012.workers.dev/api/catalog";

function money(value,currency="USD"){
  const amount=typeof value==="object"&&value?Number(value.amount||0)/Math.pow(10,Number(value.divisor||2)):Number(value||0);
  try{return new Intl.NumberFormat(undefined,{style:"currency",currency:currency||"USD"}).format(amount)}catch{return amount.toFixed(2)}
}

function firstImage(product){
  const images=Array.isArray(product.images)?product.images:[];
  const urls=images.map(x=>x&&(
    x.url_fullxfull||x.url_570xN||x.url_680x540||x.url_300x300||x.url_170x135||x.url
  )).filter(Boolean);
  return urls[0]||"";
}

function productSlug(title,id){
  return String(title||"product").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||String(id);
}

function productUrl(product){
  return "/products/"+encodeURIComponent(product.listing_id)+"/"+productSlug(product.title,product.listing_id)+"/";
}

function categoryFor(product){
  const text=(String(product.title||"")+" "+(product.tags||[]).join(" ")+" "+String(product.description||"")).toLowerCase();
  if(/halloween|spooky|gothic|masquerade|vampire/.test(text))return "Halloween";
  if(/wedding|bridal|engagement|save the date|bride/.test(text))return "Wedding";
  if(/birthday|party|celebration/.test(text))return "Birthday";
  if(/baby shower|baby|gender reveal|baptism/.test(text))return "Baby & Family";
  if(/love|romance|anniversary|valentine|apology|couple|proposal/.test(text))return "Love & Romance";
  if(/canva|template|branding|social media|instagram/.test(text))return "Templates";
  if(/invitation|invite|evite/.test(text))return "Digital Invitations";
  return "Digital Gifts";
}

function esc(v){
  return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

async function fetchCatalog(url){
  const response=await fetch(url,{headers:{"Accept":"application/json","Cache-Control":"no-cache"}});
  const data=await response.json();
  if(!response.ok||!data.success)throw new Error(data.error||("Catalog request failed: "+response.status));
  return data;
}

async function loadCatalog(){
  let lastError;
  for(const url of [DIGIFT_CATALOG_API,DIGIFT_MANAGER_CATALOG_API]){
    try{
      const data=await fetchCatalog(url);
      return data;
    }catch(error){
      lastError=error;
      console.warn("Digift catalog source failed:",url,error);
    }
  }
  throw lastError||new Error("Catalog could not be loaded.");
}

async function mountCatalog(root,{limit=0,category=""}={}){
  root.innerHTML='<div class="catalog-loading">Loading Digift Studio products…</div>';
  try{
    const data=await loadCatalog();
    let products=Array.isArray(data.products)?data.products:[];
    if(category)products=products.filter(p=>categoryFor(p)===category);
    if(limit)products=products.slice(0,limit);
    root.innerHTML=products.length?'<div class="product-grid">'+products.map(renderCard).join("")+'</div>':'<div class="catalog-empty">No products found in this collection yet.</div>';
    return data;
  }catch(error){
    root.innerHTML='<div class="catalog-empty">Catalog temporarily unavailable. Please try again shortly.</div>';
    console.error(error);
  }
}

function renderCard(product){
  const image=firstImage(product);
  const href=productUrl(product);
  const cat=categoryFor(product);
  return '<article class="product-card"><a class="product-media" href="'+href+'">'+(image?'<img src="'+esc(image)+'" alt="'+esc(product.title)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer">':'<div class="media-placeholder">DIGIFT</div>')+'</a><div class="product-info"><p class="product-category">'+esc(cat)+'</p><h3><a href="'+href+'">'+esc(product.title)+'</a></h3><div class="product-bottom"><span>'+money(product.price,product.currency_code)+'</span><a class="product-link" href="'+href+'">View →</a></div></div></article>';
}

window.DigiftCatalog={loadCatalog,mountCatalog,categoryFor,productSlug,productUrl,firstImage,money,esc};
