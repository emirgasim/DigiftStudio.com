const WORKER_URL="https://digift-manager.qasimm2012.workers.dev/api/catalog";

export async function onRequestGet(context){
  try{
    const response=await fetch(WORKER_URL,{headers:{"Accept":"application/json"}});
    const body=await response.text();
    return new Response(body,{status:response.status,headers:{
      "Content-Type":"application/json; charset=UTF-8",
      "Cache-Control":"public, max-age=60, s-maxage=60"
    }});
  }catch(error){
    return Response.json({success:false,error:"Catalog service unavailable."},{status:502});
  }
}