import type { Manager } from "@/types/api";
import { client } from "./client";


export async function login(email: string, password: string) {
    const { data } = await client.post('/auth/login', { email, password });
    return data as { access_token: string; manager: Manager };
}


export async function getMe() {
    const { data } = await client.get<Manager>('/auth/me');
    return data;
}