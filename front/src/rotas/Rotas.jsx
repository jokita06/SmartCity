import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Index } from '../paginas';
import { Home } from '../paginas/home/Home';
import { Login } from '../paginas/login/Login';
import { Sensores } from '../paginas/sensores/Sensores';

export function PrivateRoute() {
    const isAuthenticated = !!localStorage.getItem('access_token');
    
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export function RotasPublicas() {
    return (
        <Routes>
            <Route path='/' element={<Index />}>
                {/* Rotas públicas */}
                <Route index element={<Home />} />
                <Route path='home' element={<Home />} />
                <Route path='login' element={<Login />} />
                
                {/* Rotas privadas */}
                <Route element={<PrivateRoute />}>
                    <Route path='sensores' element={<Sensores />} />
                </Route>
                
                {/* Redirecionamento para login caso a rota não exista */}
                <Route path='*' element={<Navigate to="/login" />} />
            </Route>
        </Routes>
    )
}