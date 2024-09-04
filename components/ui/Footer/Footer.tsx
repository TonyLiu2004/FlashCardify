import Link from 'next/link';

import Logo from '@/components/icons/Logo';
import GitHub from '@/components/icons/GitHub';

export default function Footer() {
  return (
    

<footer className="bg-black rounded-lg shadow dark:bg-gray-900 m-4">
    <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
            <a href="https://flashcardify.net/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                <img src="new_logo.png" className="h-8" alt="FlashCardify Logo" />
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">FlashCardify</span>
            </a>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-white-500 sm:mb-0 dark:text-white-400">
                <li>
                    <a href="/contact" className="hover:underline">Contact</a>
                </li>
            </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400"> © 2024 
 <a href="https://flashcardify.net/" className="hover:underline"> FlashCardify, Inc. </a> All Rights Reserved.</span>
    </div>
</footer>


  );
}
