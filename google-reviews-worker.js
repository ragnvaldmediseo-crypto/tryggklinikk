// Cloudflare Worker API route. Deploy as part of a Worker with an /api/reviews route.
// Configure GOOGLE_PLACES_API_KEY as a secret; do not place it in browser code.
const allowed = {
"Oslo": ["Dr.CLINICA"], "Bergen": ["Klinikk Birkeland"],
"Trondheim": ["Mooi Klinikken"], "Stavanger": ["CLINIC PRIVÉ"],
"Kristiansand": ["MK Estetisk Hudklinikk"], "Drammen": ["Skin Clinic Drammen"],
"Fredrikstad": ["Skinwise"], "Sandnes": ["Clinic Flawless"],
"Tromsø": ["Velbehag Tromsø"], "Sarpsborg": ["Dermasykepleier"]
};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","access-control-allow-origin":"https://tryggklinikk.ragnvaldmediseo.workers.dev"}});
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(url.pathname!=="/api/reviews") return json({error:"Not found"},404);
  const city=url.searchParams.get("city"),clinic=url.searchParams.get("clinic");
  if(!allowed[city]?.includes(clinic))return json({error:"Unknown clinic"},400);
  if(!env.GOOGLE_PLACES_API_KEY)return json({error:"Google Places API is not configured"},503);
  try {
   const headers={"X-Goog-Api-Key":env.GOOGLE_PLACES_API_KEY,"Content-Type":"application/json","X-Goog-FieldMask":"places.id,places.displayName,places.formattedAddress"};
   const search=await fetch("https://places.googleapis.com/v1/places:searchText",{method:"POST",headers,body:JSON.stringify({textQuery:clinic+", "+city+", Norway",languageCode:"no",regionCode:"NO",pageSize:3})});
   if(!search.ok)return json({error:"Google lookup unavailable"},502);
   const candidates=(await search.json()).places||[];
   const normalized=s=>String(s||"").toLocaleLowerCase("nb-NO").replace(/[^a-zæøå0-9]+/g," ").trim();
   const expected=normalized(clinic);
   // Fail closed rather than display another business's reviews.
   const match=candidates.find(p=>normalized(p.displayName?.text)===expected&&normalized(p.formattedAddress).includes(normalized(city)));
   if(!match)return json({error:"Clinic identity requires verification"},404);
   const detail=await fetch("https://places.googleapis.com/v1/places/"+encodeURIComponent(match.id),{headers:{"X-Goog-Api-Key":env.GOOGLE_PLACES_API_KEY,"X-Goog-FieldMask":"id,displayName,googleMapsUri,reviews"}});
   if(!detail.ok)return json({error:"Review lookup unavailable"},502);
   const place=await detail.json();
   const reviews=(place.reviews||[]).slice(0,3).map(r=>({author:r.authorAttribution?.displayName||"Google-bruker",authorUrl:r.authorAttribution?.uri||"",avatar:r.authorAttribution?.photoUri||"",rating:r.rating,date:r.relativePublishTimeDescription||"",text:r.text?.text||r.originalText?.text||"",url:r.googleMapsUri||place.googleMapsUri||""}));
   return json({clinic:place.displayName?.text,mapsUrl:place.googleMapsUri,reviews,order:"relevance"});
  }catch(e){return json({error:"Review service temporarily unavailable"},502)}
 }
};
