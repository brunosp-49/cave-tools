import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

// Define the Cavidade Model
export default class User extends Model {
  static table = 'user'; 

  @field('token') token!: string;
  @field('refresh_token') refresh_token!: string;
  @field('last_login_date') last_login_date!: string;
}
