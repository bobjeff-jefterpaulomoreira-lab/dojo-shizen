import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="text-primary" size={28} />
          <h1 className="text-2xl font-serif font-bold text-foreground">Privacy Policy</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-8">Last updated: April 2026</p>

        {/* Content */}
        <div className="space-y-8 text-foreground/90 text-sm leading-relaxed">
          {/* No Data Collection */}
          <section>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-3">1. No Data Collection</h2>
            <p>
              Dojo Shizen does not collect, store, or share any personal data beyond what is strictly 
              necessary for the operation of the application. All user data (name, email, belt rank, 
              attendance records) is stored securely in the application's backend database and is never 
              sold, shared with, or disclosed to third parties for marketing or advertising purposes.
            </p>
            <p className="mt-2">
              We do not use cookies for tracking, behavioral analytics, or targeted advertising. 
              No personally identifiable information is transmitted to external analytics services.
            </p>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-3">2. Data Storage &amp; Security</h2>
            <p>
              User accounts are protected by industry-standard authentication mechanisms including 
              encrypted passwords and secure session tokens. Access to student records is restricted 
              through row-level security policies, ensuring that each user can only access their own data 
              unless explicitly authorized (e.g., instructors viewing student progress).
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-3">3. Third-Party Services</h2>
            <p>
              This application is hosted on <strong>Vercel / Lovable</strong> infrastructure. These hosting 
              providers may collect standard server logs (IP address, request timestamps, user-agent strings) 
              as part of normal web server operations. This data is used solely for infrastructure monitoring 
              and security purposes. Please refer to their respective privacy policies for more details:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Vercel Privacy Policy: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">vercel.com/legal/privacy-policy</a></li>
              <li>Lovable Privacy Policy: <a href="https://lovable.dev/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">lovable.dev/privacy</a></li>
            </ul>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-3">4. Children's Privacy</h2>
            <p>
              Dojo Shizen may be used by minors under the supervision of their parents or legal guardians. 
              Student accounts for minors are created and managed by authorized instructors. We do not 
              knowingly collect personal information from children without parental consent.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-3">5. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected on this page 
              with an updated revision date. Continued use of the application after any changes constitutes 
              acceptance of the revised policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-3">6. Contact</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 font-medium">
              <a href="mailto:jefterpaulomoreira@gmail.com" className="text-primary underline">
                jefterpaulomoreira@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
