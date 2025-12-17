'use client';

import Link from 'next/link';
import Image from 'next/image';
import {Facebook, Instagram, Youtube, Mail, Phone, MapPin, Plus, Minus} from 'lucide-react';
import {Input} from '../ui/input';
import {Button} from '../ui/button';
import {useEffect, useState} from 'react';
import {policiesService, Policy} from '../../lib/api';

type FooterLink = {name: string; href: string};

const footerLinks: {
  shop: FooterLink[];
  support: FooterLink[];
  company: FooterLink[];
} = {
  shop: [
    {name: 'All Products', href: '/products'},
    {name: 'Smartphones', href: '/category/smartphones'},
    {name: 'Laptops', href: '/category/laptops'},
    {name: 'Tablets', href: '/category/tablets'},
    {name: 'Accessories', href: '/category/accessories'},
  ],
  support: [
    // ...add items or keep empty...
  ],
  company: [
    {name: 'About Us', href: '/about'},
    {name: 'Contact Us', href: '/contact'},
    {name: 'Giveaway', href: '/giveaway'},
    {name: 'Blog', href: '/blog'},
  ],
};

export function Footer() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    shop: false,
    support: false,
    company: false,
  });

  useEffect(() => {
    // Fetch all policies
    policiesService.getAll().then(result => {
      setPolicies(result.data);
    });
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="border-t border-gray-800 bg-black text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Desktop Grid Layout (hidden on mobile) */}
        <div className="hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-6">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/image/logo1.png"
                alt="Friend's Telecom"
                width={140}
                height={30}
                className="rounded-lg object-contain"
                priority
              />
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Your trusted destination for Apple products and mobile devices in
              Dhaka.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold">
                Subscribe to our newsletter
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                Get updates on new products and exclusive deals.
              </p>
              <form className="mt-3 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
                />
                <Button
                  size="sm"
                  className="h-9 bg-white text-black hover:bg-gray-200">
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.facebook.com/FriendsTelecom2015"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700">
                <Facebook className="h-4 w-4" />
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@friendstelecom2015"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700"
                aria-label="TikTok">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true">
                  <path d="M16.5 3.5h2.25v3.375a5.625 5.625 0 0 1-5.625-3.375H16.5zM9 8.25a6.75 6.75 0 1 0 6.75 6.75v-6.75h-1.5v6.75A5.25 5.25 0 1 1 9 8.25z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/friendstelecom2015/"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700">
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@friendstelecom2015"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.shop.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
              {/* All policies as links */}
              {policies.map(policy => (
                <li key={policy.slug}>
                  <Link
                    href={`/privacy-policy/${policy.slug}`}
                    className="text-sm text-gray-400 transition-colors hover:text-white">
                    {policy.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-sm text-gray-400">
                  Bashundhara City Shopping Complex Basement 2, Shop 25, Dhaka,
                  Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href="tel:+8801234567890"
                  className="text-sm text-gray-400 hover:text-white">
                  +880 1343-159931
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href="mailto:support@Friend's Telecom.com"
                  className="text-sm text-gray-400 hover:text-white">
                  help.frtel@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Accordion Layout */}
        <div className="space-y-4 md:hidden">
          {/* Brand & Newsletter */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/image/logo1.png"
                alt="Friend's Telecom"
                width={140}
                height={30}
                className="rounded-lg object-contain"
                priority
              />
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Your trusted destination for Apple products and mobile devices in
              Dhaka.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold">
                Subscribe to our newsletter
              </h4>
              <p className="mt-1 text-xs text-gray-400">
                Get updates on new products and exclusive deals.
              </p>
              <form className="mt-3 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-9 flex-1 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-gray-600"
                />
                <Button
                  size="sm"
                  className="h-9 bg-white text-black hover:bg-gray-200">
                  Subscribe
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.facebook.com/FriendsTelecom2015"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700">
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@friendstelecom2015"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700"
                aria-label="TikTok">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                  aria-hidden="true">
                  <path d="M16.5 3.5h2.25v3.375a5.625 5.625 0 0 1-5.625-3.375H16.5zM9 8.25a6.75 6.75 0 1 0 6.75 6.75v-6.75h-1.5v6.75A5.25 5.25 0 1 1 9 8.25z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/friendstelecom2015/"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700">
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@friendstelecom2015"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-gray-700">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="border-t border-gray-800 pt-4">
            {/* Shop Section */}
            <div>
              <button
                onClick={() => toggleSection('shop')}
                className="flex w-full items-center justify-between py-3">
                <h4 className="text-sm font-semibold">Shop</h4>
                {expandedSections.shop ? (
                  <Minus className="h-5 w-5 text-gray-400" />
                ) : (
                  <Plus className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.shop && (
                <ul className="space-y-2 pb-4">
                  {footerLinks.shop.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition-colors hover:text-white">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Support/Help Section */}
            <div className="border-t border-gray-800">
              <button
                onClick={() => toggleSection('support')}
                className="flex w-full items-center justify-between py-3">
                <h4 className="text-sm font-semibold">Help</h4>
                {expandedSections.support ? (
                  <Minus className="h-5 w-5 text-gray-400" />
                ) : (
                  <Plus className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.support && (
                <ul className="space-y-2 pb-4">
                  {footerLinks.support.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition-colors hover:text-white">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                  {policies.map(policy => (
                    <li key={policy.slug}>
                      <Link
                        href={`/privacy-policy/${policy.slug}`}
                        className="text-sm text-gray-400 transition-colors hover:text-white">
                        {policy.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Company Section */}
            <div className="border-t border-gray-800">
              <button
                onClick={() => toggleSection('company')}
                className="flex w-full items-center justify-between py-3">
                <h4 className="text-sm font-semibold">Company</h4>
                {expandedSections.company ? (
                  <Minus className="h-5 w-5 text-gray-400" />
                ) : (
                  <Plus className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.company && (
                <ul className="space-y-2 pb-4">
                  {footerLinks.company.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 transition-colors hover:text-white">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="border-t border-gray-800 pt-4">
            <h4 className="text-sm font-semibold">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span className="text-sm text-gray-400">
                  Bashundhara City Shopping Complex Basement 2, Shop 25, Dhaka,
                  Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href="tel:+8801234567890"
                  className="text-sm text-gray-400 hover:text-white">
                  +880 1343-159931
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href="mailto:support@Friend's Telecom.com"
                  className="text-sm text-gray-400 hover:text-white">
                  help.frtel@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Friend&apos;s Telecom. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
