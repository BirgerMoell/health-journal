'use client'
import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-500 text-white">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl opacity-90">
            Your health data privacy is our priority
          </p>
          <p className="text-sm mt-4 opacity-80">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="prose prose-green max-w-none">
            <h2>Introduction</h2>
            <p>
              At Health Journal, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our mobile application and website.
            </p>
            
            <p>
              Please read this Privacy Policy carefully. By accessing or using the Health Journal app, you 
              acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this policy.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you provide directly to us, such as:</p>
            <ul>
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Health-related information you choose to log</li>
              <li>Communications you send directly to us</li>
            </ul>

            <h3>Health Data</h3>
            <p>
              Health Journal collects health-related information that you voluntarily provide, including but not 
              limited to journal entries, mood tracking, medication logs, and other health metrics. We understand 
              the sensitive nature of this information and treat it with the utmost care.
            </p>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Develop new products and services</li>
              <li>Generate anonymized, aggregate statistics about app usage</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures designed to protect the 
              security of any personal information we process. However, no electronic transmission over the 
              internet or information storage technology can be guaranteed to be 100% secure, so while we strive 
              to protect your personal information, we cannot guarantee its absolute security.
            </p>

            <h2>Data Retention</h2>
            <p>
              We store your personal information for as long as your account is active or as needed to provide 
              you with our services. You can request deletion of your account and associated data at any time.
            </p>

            <h2>Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul>
              <li>Access and update your information</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>

            <h2>Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 13. We do not knowingly collect 
              personal information from children under 13 years of age.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: <a href="mailto:privacy@healthjournal.com" className="text-green-600">privacy@healthjournal.com</a><br />
              Address: Health Journal Inc., 123 Wellness Street, San Francisco, CA 94105
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link 
            href="/" 
            className="text-green-600 hover:text-green-800 flex items-center"
          >
            ← Back to Health Journal
          </Link>
          <Link 
            href="/faq" 
            className="text-green-600 hover:text-green-800 flex items-center"
          >
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
}