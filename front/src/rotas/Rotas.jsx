import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home } from '../paginas/home/home';
import { Index } from '../paginas';

export function RotasPublicas() {
    return (
        <Routes>
            <Route path='/' element={<Index />}>
                <Route index element={<Home />} />
                <Route path='home' element={<Home />} />
            </Route>
        </Routes>
    )
}