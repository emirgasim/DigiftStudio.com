export async function onRequestGet(context){
 const origin=new URL(context.request.url).origin;
 const worker="https://digift-manager.qasimm2012.workers.dev/api/catalog";
 try{
  const response=await fetch(worker,{headers:{"Accept":"application/json"}});
  if(!response.ok)throw new Error("catalog");
  const data=await response.json();
  const urls=[origin+"/",origin+"/shop/"];
  for(const p of data.products||[])urls.push(origin+"/products/"+p.listing_id+"/"+String(p.title||"product").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)+"/");
  const body='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>'<url><loc>'+u.replace(/&/g,"&amp;")+'</loc></url>').join("")+'</urlset>';
  return new Response(body,{headers:{"Content-Type":"application/xml; charset=UTF-8","Cache-Control":"public, max-age=300, s-maxage=300"}});
 }catch{return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+origin+'/</loc></url><url><loc>'+origin+'/shop/</loc></url></urlset>',{headers:{"Content-Type":"application/xml; charset=UTF-8"}})}
}