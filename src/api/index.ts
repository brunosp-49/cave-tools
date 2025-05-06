import axios from 'axios'

export const api = axios.create({
    baseURL: 'https://api-cave-tools.geobyte.dev/api',
})