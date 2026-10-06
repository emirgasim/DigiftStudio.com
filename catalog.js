const DIGIFT_CATALOG_API="/api/catalog";

function money(value,currency="USD"){
  const amount=typeof value==="object"&&value?Number(value.amount||0)/Math.pow(10,Number(value.divisor||2)):Number(value||0);
  try{return new Intl.NumberFormat(undefined,{style:"currency",currency:currency||"USD"}).format(amount)}catch{return amount.toFixed(2)}
}
function firstImage(product){
  const images=Array.isArray(product.images)?product.images:[];
  return images.find(x=>x.url_fullxfull)?.url_fullxfull||images.find(x=>x.url_570xN)?.url_570xN||images.find(x=>x.url_170x135)?.url_170x135||"";
}
function productSlug(title,id){
  return String(title||"product").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)||String(id);
}
function productUrl(product){return "/products/"+encodeURIComponent(product.listing_id)+"/"+productSlug(product.title,product.listing_id)+"/";}
function categoryFor(product){
  const text=(String(product.title||"")+" "+(product.tags||[]).join(" ")).toLowerCase();
  if(/halloween|spooky|gothic|masquerade/.test(text))return "Halloween";
  if(/wedding|bridal|engagement|save the date/.test(text))return "Wedding";
  if(/birthday|party/.test(text))return "Birthday";
  if(/baby shower|baby/.test(text))return "Baby & Family";
  if(/love|romance|anniversary|valentine|apology|couple/.test(text))return "Love & Romance";
  if(/canva|template|branding|social media|instagram/.test(text))return "Templates";
  if(/invitation|invite|evite/.test(text))return "Digital Invitations";
  return "Digital Gifts";
}
function renderCard(product){
  const image=firstImage(product);
  const href=productUrl(product);
  const cat=categoryFor(product);
  return '<article class="product-card"><a class="product-media" href="'+href+'">'+(image?'<img src="'+image+'" alt="'+esc(product.title)+'" loading="lazy">':'<div class="media-placeholder">DIGIFT</div>')+'</a><div class="product-info"><p class="product-category">'+esc(cat)+'</p><h3><a href="'+href+'">'+esc(product.title)+'</a></h3><div class="product-bottom"><span>'+money(product.price,product.currency_code)+'</span><a class="product-link" href="'+href+'">View →</a></div></div></article>';
}
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}

async function loadCatalog(){
  const response=await fetch(DIGIFT_CATALOG_API,{headers:{"Accept":"application/json"}});
  const data=await response.json();
  if(!response.ok||!data.success)throw new Error(data.error||"Catalog could not be loaded.");
  return data;
}

async function mountCatalog(root,{limit=0,category=""}={}){
  root.innerHTML='<div class="catalog-loading">Loading Digift Studio products…</div>';
  try{
    const data=await loadCatalog();
    let products=data.products||[];
    if(category)products=products.filter(p=>categoryFor(p)===category);
    if(limit)products=products.slice(0,limit);
    root.innerHTML=products.length?'<div class="product-grid">'+products.map(renderCard).join("")+'</div>':'<div class="catalog-empty">No products found in this collection yet.</div>';
    return data;
  }catch(error){
    root.innerHTML='<div class="catalog-empty">Catalog temporarily unavailable. Please try again shortly.</div>';
    console.error(error);
  }
}

window.DigiftCatalog={loadCatalog,mountCatalog,categoryFor,productSlug,productUrl,firstImage,money};