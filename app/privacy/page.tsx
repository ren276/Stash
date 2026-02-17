export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary font-[family-name:var(--font-body)] py-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold font-[family-name:var(--font-syne)] mb-8">Privacy Policy</h1>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Introduction</h2>
                    <p className="text-text-secondary leading-relaxed">
                        Welcome to Stash. We value your privacy and are committed to protecting your personal data.
                        This privacy policy explains how we collect, use, and safeguard your information when you use our service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. Data Collection</h2>
                    <p className="text-text-secondary leading-relaxed">
                        We collect minimal data necessary to provide our services. This includes:
                    </p>
                    <ul className="list-disc pl-6 text-text-secondary space-y-2">
                        <li>Account information (email, name) for authentication via Supabase.</li>
                        <li>User-generated content (links, snippets, resumes) which you explicitly save to your personal stash.</li>
                        <li>Usage data (analytics) to improve our service performance.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. Data Usage</h2>
                    <p className="text-text-secondary leading-relaxed">
                        Your data is used solely to:
                    </p>
                    <ul className="list-disc pl-6 text-text-secondary space-y-2">
                        <li>Provide, maintain, and improve the Stash platform.</li>
                        <li>Authenticate your identity and secure your account.</li>
                        <li>Communicate with you regarding updates or support.</li>
                    </ul>
                    <p className="text-text-secondary leading-relaxed mt-4">
                        We do <strong>not</strong> sell your personal data to third parties.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Data Security</h2>
                    <p className="text-text-secondary leading-relaxed">
                        We implement industry-standard security measures, including encryption and secure authentication providers (Supabase),
                        to protect your data from unauthorized access.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Contact Us</h2>
                    <p className="text-text-secondary leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at support@stash.app.
                    </p>
                </section>

                <div className="pt-8 border-t border-border">
                    <p className="text-sm text-text-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
