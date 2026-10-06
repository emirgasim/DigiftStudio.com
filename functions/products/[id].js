import { onRequestGet as renderProduct } from "./[[path]].js";

export async function onRequestGet(context){
  return renderProduct({
    ...context,
    params:{path:[context.params.id]}
  });
}
