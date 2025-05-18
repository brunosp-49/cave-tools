import { tableSchema } from "@nozbe/watermelondb";

export const user = tableSchema({
  name: "user",
  columns: [
    { name: "user_id", type: "string" },
    { name: "token", type: "string" },
    { name: "refresh_token", type: "string" },
    { name: "last_login_date", type: "string" },
    {name: "user_name", type: "string"},
  ],
});