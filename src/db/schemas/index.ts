import { appSchema } from "@nozbe/watermelondb";
import cavityRegister from "./cavityRegister";
import { user } from "./user";
import project from "./project";
import { topography } from "./topography";

export default appSchema({
  version: 27,
  tables: [cavityRegister, user, project, topography],
});
