"use client"
import { useState, useEffect } from 'react';

export default function Home() {
    const [data, setData] = useState<any>(null);
    

    useEffect(() => {
        fetch('/api/gpt')  // This is the relative path to your API route
            .then(response => response.json())
            .then(json => setData(json));
    }, []);

    return (
        <div>
            <h1>Next.js API Request Example</h1>
            {data ? (
                <div>
                    <p>{data.message}</p>
                    <ul>
                        {data.data.map((item: any, index: number) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}