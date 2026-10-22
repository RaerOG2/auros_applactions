import { supabase } from "../lib/supabase";

export type EntryStatus="registered"|"waitlisted"|"checked_in"|"active"|"eliminated"|"withdrawn"|"disqualified";
export type TournamentParticipant={id:string;playerId:string|null;displayName:string;competitiveId:string|null;epicDisplayName:string|null;status:EntryStatus;seed:number|null;checkedInAt:string|null};

export async function getTournamentForRegistration(slug:string){
 const {data,error}=await supabase.from("competitive_tournaments").select("*").eq("slug",slug).maybeSingle();
 if(error)throw error; return data;
}
export async function getMyTournamentEntry(tournamentId:string){
 const {data,error}=await supabase.rpc("my_competitive_entry",{p_tournament_id:tournamentId});
 if(error)throw error; return data?.[0]??null;
}
export async function registerForTournament(tournamentId:string){
 const {data,error}=await supabase.rpc("register_for_competitive_tournament",{p_tournament_id:tournamentId});
 if(error)throw error; return data as string;
}
export async function checkInTournament(tournamentId:string){
 const {error}=await supabase.rpc("check_in_competitive_tournament",{p_tournament_id:tournamentId}); if(error)throw error;
}
export async function startTournament(tournamentId:string){
 const {error}=await supabase.rpc("start_competitive_tournament",{p_tournament_id:tournamentId}); if(error)throw error;
}
export async function getTournamentParticipants(tournamentId:string):Promise<TournamentParticipant[]>{
 const {data:entries,error}=await supabase.from("competitive_entries").select("id,display_name,status,seed,checked_in_at").eq("tournament_id",tournamentId).order("created_at");
 if(error)throw error; const ids=(entries??[]).map(e=>e.id); if(!ids.length)return [];
 const {data:members,error:me}=await supabase.from("competitive_entry_members").select("entry_id,player_id").in("entry_id",ids); if(me)throw me;
 const pids=[...new Set((members??[]).map(m=>m.player_id))];
 const {data:profiles,error:pe}=pids.length?await supabase.from("competitive_profiles").select("id,competitive_id,epic_display_name").in("id",pids):{data:[],error:null}; if(pe)throw pe;
 const mb=new Map((members??[]).map(m=>[m.entry_id,m.player_id])); const pb=new Map((profiles??[]).map(p=>[p.id,p]));
 return (entries??[]).map(e=>{const pid=mb.get(e.id)??null;const p=pid?pb.get(pid):null;return{id:e.id,playerId:pid,displayName:e.display_name,competitiveId:p?.competitive_id??null,epicDisplayName:p?.epic_display_name??null,status:e.status as EntryStatus,seed:e.seed??null,checkedInAt:e.checked_in_at??null}});
}
export async function updateParticipant(entryId:string,status:EntryStatus){
 const {error}=await supabase.from("competitive_entries").update({status,updated_at:new Date().toISOString()}).eq("id",entryId);if(error)throw error;
}
export async function addParticipantByCompetitiveId(tournamentId:string,competitiveId:string){
 const {data:p,error}=await supabase.from("competitive_profiles").select("id,competitive_id,epic_display_name").eq("competitive_id",competitiveId.trim().toUpperCase()).maybeSingle();
 if(error)throw error;if(!p)throw new Error("Competitive ID not found.");
 const {data:entry,error:ee}=await supabase.from("competitive_entries").insert({tournament_id:tournamentId,display_name:p.epic_display_name||p.competitive_id,status:"registered"}).select("id").single();
 if(ee)throw ee;
 const {error:me}=await supabase.from("competitive_entry_members").insert({entry_id:entry.id,player_id:p.id,is_captain:true});
 if(me){await supabase.from("competitive_entries").delete().eq("id",entry.id);throw me} return entry.id as string;
}
