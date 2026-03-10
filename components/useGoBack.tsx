"use client";
import React from 'react'
import {useRouter} from 'next/navigation';
export default function useGoBack() {
    const router = useRouter();
    const goBack = () => {
        if(window.history.length>1){
            router.back();
        }else{
            router.push("/");
        }
    }
    return goBack;
}
