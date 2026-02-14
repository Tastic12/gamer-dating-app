import { APP_NAME } from '@/lib/constants'

export const metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: February 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to {APP_NAME}. We respect your privacy and are committed to protecting your personal
          data. This privacy policy explains how we collect, use, and safeguard your information when
          you use our dating platform for gamers.
        </p>

        <h2>2. Data We Collect</h2>
        <h3>2.1 Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> Email address, password, date of birth</li>
          <li><strong>Profile Information:</strong> Display name, pronouns, region, bio, photos</li>
          <li><strong>Gaming Preferences:</strong> Platforms, favorite genres, top games, playstyle, play times</li>
          <li><strong>Communications:</strong> Messages sent through the platform</li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <ul>
          <li>Device information and browser type</li>
          <li>Usage data and interaction patterns</li>
          <li>Log data and error reports</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>We use your data to:</p>
        <ul>
          <li>Provide and maintain our service</li>
          <li>Match you with compatible gaming partners</li>
          <li>Enable communication between matched users</li>
          <li>Improve our matching algorithms and user experience</li>
          <li>Ensure platform safety and prevent abuse</li>
          <li>Send service-related communications</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share data with:
        </p>
        <ul>
          <li><strong>Other Users:</strong> Profile information visible to potential matches</li>
          <li><strong>Service Providers:</strong> Hosting, analytics, and communication services</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
        </ul>

        <h2>5. Your Rights (GDPR)</h2>
        <p>Under GDPR and similar regulations, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate data</li>
          <li><strong>Erasure:</strong> Request deletion of your data</li>
          <li><strong>Data Portability:</strong> Export your data in a machine-readable format</li>
          <li><strong>Withdraw Consent:</strong> Opt out of data processing</li>
        </ul>
        <p>
          You can exercise these rights through your account settings or by contacting us.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We implement industry-standard security measures including:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication and session management</li>
          <li>Regular security audits and monitoring</li>
          <li>Access controls and data minimization</li>
        </ul>

        <h2>7. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. When you delete your account:
        </p>
        <ul>
          <li>Your profile is immediately hidden from other users</li>
          <li>A 30-day grace period allows you to recover your account</li>
          <li>After 30 days, your data is permanently deleted</li>
        </ul>

        <h2>8. Cookies and Tracking</h2>
        <p>
          We use essential cookies for authentication and session management. We may use analytics
          tools to understand usage patterns and improve our service.
        </p>

        <h2>9. Age Restriction</h2>
        <p>
          {APP_NAME} is only available to users who are 18 years of age or older. We do not knowingly
          collect data from minors.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of significant
          changes through the app or via email.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have questions about this privacy policy or your data, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> privacy@gamermatch.app
        </p>
      </div>
    </div>
  )
}
