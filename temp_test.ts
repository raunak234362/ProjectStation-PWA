type UserObjType = {
  id: string;username?: string; connectionDesignerName?:string; name?:string;
}
const cdObj1: UserObjType = {id: "25610775-cf73-4d21-b140-8511362d426e", username: "DAVID@STEELPREMIER"};
const cdObj2: UserObjType = {id: "b74dda2e-aa6a-4751-9473-6362b8d07cc3", name: "Steel Premier Engineers, Inc."};
const cds: any[] = [{CDEngineers: [cdObj1], id: cdObj2.id, name: cdObj2.name }];
const tempFunc = (c: any) => ({
      label: c.connectionDesignerName || c.name,
      value: String(c.id),
    })

console.log(cds.map(tempFunc));
