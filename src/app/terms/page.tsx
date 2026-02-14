import { APP_NAME } from '@/lib/constants'

export const metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: February 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service. If you
          do not agree to these terms, please do not use our service.
        </p>

        <h2>2. Eligibility</h2>
        <p>To use {APP_NAME}, you must:</p>
        <ul>
          <li>Be at least 18 years of age</li>
          <li>Have the legal capacity to enter into a binding agreement</li>
          <li>Not be prohibited from using the service under applicable law</li>
          <li>Not have been previously banned from the platform</li>
        </ul>

        <h2>3. Account Registration</h2>
        <p>When creating an account, you agree to:</p>
        <ul>
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized access</li>
          <li>Be responsible for all activities under your account</li>
        </ul>

        <h2>4. User Conduct</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Create false or misleading profiles</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Post inappropriate, offensive, or illegal content</li>
          <li>Use the service for commercial purposes or spam</li>
          <li>Attempt to access other users&apos; accounts</li>
          <li>Circumvent or manipulate platform features</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>

        <h2>5. Content Guidelines</h2>
        <h3>5.1 Your Content</h3>
        <p>
          You retain ownership of content you post but grant us a license to use, display, and
          distribute it within the platform for the purpose of providing our services.
        </p>

        <h3>5.2 Prohibited Content</h3>
        <ul>
          <li>Nudity or sexually explicit material</li>
          <li>Hate speech or discriminatory content</li>
          <li>Violence or threats</li>
          <li>Spam or promotional content</li>
          <li>Content involving minors</li>
          <li>Copyrighted material without permission</li>
        </ul>

        <h2>6. Safety and Reporting</h2>
        <p>
          We take safety seriously. Users can report inappropriate behavior through the app. We
          reserve the right to investigate reports and take action including:
        </p>
        <ul>
          <li>Issuing warnings</li>
          <li>Temporarily suspending accounts</li>
          <li>Permanently banning users</li>
          <li>Cooperating with law enforcement when necessary</li>
        </ul>

        <h2>7. Matching and Communication</h2>
        <p>
          {APP_NAME} provides tools to discover and connect with other gamers. We do not guarantee:
        </p>
        <ul>
          <li>The accuracy of other users&apos; profiles</li>
          <li>The behavior or intentions of other users</li>
          <li>Specific outcomes from using our service</li>
        </ul>
        <p>
          Always exercise caution when meeting people online and in person.
        </p>

        <h2>8. Intellectual Property</h2>
        <p>
          The {APP_NAME} name, logo, and all related content are our intellectual property. You may
          not use our branding without written permission.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate your account at any time for violations of these terms or for
          any other reason at our discretion. You may delete your account at any time through the
          settings page.
        </p>

        <h2>10. Disclaimers</h2>
        <p>
          {APP_NAME} is provided &quot;as is&quot; without warranties of any kind. We do not guarantee:
        </p>
        <ul>
          <li>Uninterrupted or error-free service</li>
          <li>The accuracy or reliability of any content</li>
          <li>The safety or conduct of other users</li>
        </ul>

        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {APP_NAME} shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the service.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the service after changes
          constitutes acceptance of the new terms.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These terms are governed by applicable law. Any disputes shall be resolved through
          appropriate legal channels.
        </p>

        <h2>14. Contact</h2>
        <p>
          For questions about these terms, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> support@gamermatch.app
        </p>
      </div>
    </div>
  )
}
