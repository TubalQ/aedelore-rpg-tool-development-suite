import { Request } from 'express';

// Database types
export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: Date;
}

export interface Character {
    id: number;
    user_id: number;
    name: string;
    system: string;
    data: Record<string, unknown>;
    race_class_locked: boolean;
    attributes_locked: boolean;
    abilities_locked: boolean;
    campaign_id?: number;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface Campaign {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface Session {
    id: number;
    campaign_id: number;
    user_id: number;
    session_number: number;
    date: string;
    location: string;
    status: 'planning' | 'active' | 'completed';
    data: SessionData;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface SessionData {
    encounters?: Encounter[];
    places?: Place[];
    npcs?: NPC[];
    notes?: string;
    [key: string]: unknown;
}

export interface Encounter {
    name: string;
    type: 'combat' | 'social' | 'exploration' | 'puzzle';
    description?: string;
    monsters?: string[];
}

export interface Place {
    name: string;
    description?: string;
}

export interface NPC {
    name: string;
    role?: string;
    notes?: string;
}

export interface AuthToken {
    id: number;
    token: string;
    user_id: number;
    created_at: Date;
}

// Express extension
export interface AuthenticatedRequest extends Request {
    userId: number;
    csrfToken?: string;
}

// API response types
export interface ApiError {
    error: string;
}

export interface ApiSuccess {
    success: boolean;
}

export interface LoginResponse extends ApiSuccess {
    token: string;
    userId: number;
}

export interface CharacterResponse extends Character {
    campaign?: {
        id: number;
        name: string;
        description?: string;
        dm_name: string;
    };
}

// Metrics types
export interface Metrics {
    startTime: number;
    requests: {
        total: number;
        byEndpoint: Record<string, number>;
        byMethod: Record<string, number>;
    };
    auth: {
        logins: number;
        registrations: number;
        logouts: number;
        deletedAccounts: number;
    };
    characters: {
        saves: number;
        loads: number;
        deletes: number;
    };
    sessions: {
        saves: number;
        loads: number;
        deletes: number;
        locks: number;
    };
    frontendErrors: {
        total: number;
        byType: Record<string, number>;
        byPage: Record<string, number>;
    };
    errors: number;
}
