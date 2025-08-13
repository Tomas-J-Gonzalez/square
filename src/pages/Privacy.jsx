import React from 'react';

const Privacy = () => {
  return (
    <div className="section">
      <div className="section-container max-w-3xl mx-auto">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-16">Privacy Policy</h1>
          <div className="space-y-12 text-gray-700 text-sm leading-6">
            <p>We collect minimal information to operate the app, such as names, emails, and RSVP choices. Data is stored locally in your browser and/or securely with our service providers.</p>
            <p>We do not sell your personal information. We use data to provide and improve the service, send transactional emails, and maintain security. You may request deletion of your data by contacting us.</p>
            <p>Third‑party services (e.g., email and hosting providers) may process data under their own policies. We take reasonable steps to protect information, but no system is 100% secure.</p>
            <p>We may update this policy as needed. Continued use means you accept the updated policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


