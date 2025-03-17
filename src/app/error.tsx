'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600"
                onClick={() => reset()}
            >
                Try again
            </button>
        </div>
    )
}