"use client";

import React, { useState } from 'react'

function TechEngi() {
    const [email, setEmail] = useState("")

    const handleSubscribe = async () => {
        if (!email) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                alert("Thank you for subscribing to Tech Engi updates!");
                setEmail("");
            } else {
                alert("Failed to subscribe. Please try again later.");
            }
        } catch (error) {
            console.error("Error subscribing:", error);
            alert("An error occurred. Please try again later.");
        }
    }
  return (
    <div className='w-full md:h-48 h-auto my-4 md:px-10 md:py-4 px-4 py-2'>
        <div className="w-full h-full bg-gray-100 rounded-2xl px-10 flex md:justify-between justify-center items-center md:flex-row flex-col gap-4">
            <div>
            <h1 className='md:text-xl md:text-left text-center text-lg font-bold tracking-tighter text-yellow-500'>TECH ENGI</h1>
            <h2 className='mt-1 md:text-2xl text-lg font-medium'>Expert connect, coming soon!</h2>
            </div>

            <div className="md:w-1/3 w-full md:flex-row flex-col flex justify-center items-center md:gap-3 gap-2">
                <input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type='email'
                    placeholder='Enter your email'
                    className='w-full px-4 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#f0b31e] focus:border-transparent'
                />

                <button
                onClick={handleSubscribe}
                className='bg-[#f0b31e] px-4 py-2 rounded-lg text-white uppercase font-semibold hover:bg-[#d18a00] cursor-pointer hover:tracking-normal tracking-widest transition-all duration-300 hover:scale-90'
                >Subscribe</button>
            </div>
        </div>
    </div>
  )
}

export default TechEngi