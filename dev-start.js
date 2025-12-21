#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ENV_FILE = '.env';
const envPath = resolve(ENV_FILE);

// Check if .env exists
if (!existsSync(envPath)) {
    console.error(`❌ Error: ${ENV_FILE} file not found!`);
    console.error('Create a .env file in the project root with your environment variables.');
    process.exit(1);
}

console.log(`📝 Loading environment variables from ${ENV_FILE}...`);

// Read and parse .env file
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
    // Remove whitespace and carriage returns
    line = line.trim().replace(/\r$/, '');
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
        return;
    }
    
    // Parse KEY=value
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        
        envVars[key] = cleanValue;
        process.env[key] = cleanValue;
        
        console.log(`  ✓ ${key}`);
    }
});

console.log('');
console.log('🚀 Starting development server with nodemon...');
console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${process.env.PORT || 3000}`);
console.log('');

// Start nodemon with inherited environment
const nodemon = spawn('nodemon', ['src/server.js'], {
    stdio: 'inherit',
    env: { ...process.env, ...envVars },
    shell: true
});

nodemon.on('error', (error) => {
    console.error('❌ Failed to start nodemon:', error.message);
    process.exit(1);
});

nodemon.on('exit', (code) => {
    process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    nodemon.kill('SIGINT');
});