import { tableSchema } from "@nozbe/watermelondb";

export const user = tableSchema({
  name: "user",
  columns: [
    { name: "token", type: "string" },
    { name: "refresh_token", type: "string" },
    { name: "last_login_date", type: "string" },
  ],
});