export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-text-primary font-[family-name:var(--font-body)] py-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold font-[family-name:var(--font-syne)] mb-8">Terms of Service</h1>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                    <p className="text-text-secondary leading-relaxed">
                        By accessing and using Stash ("Service"), you agree to comply with and be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our Service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">2. User Responsibilities</h2>
                    <p className="text-text-secondary leading-relaxed">
                        You are responsible for:
                    </p>
                    <ul className="list-disc pl-6 text-text-secondary space-y-2">
                        <li>maintaining the confidentiality of your account credentials.</li>
                        <li>all activities that occur under your account.</li>
                        <li>ensuring that your use of the Service complies with applicable laws.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">3. Intellectual Property</h2>
                    <p className="text-text-secondary leading-relaxed">
                        The content you upload (links, snippets, resumes) remains yours.
                        The Stash platform, including its code, design, and branding, is owned by Stash Inc. and protected by copyright laws.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">4. Termination</h2>
                    <p className="text-text-secondary leading-relaxed">
                        We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice,
                        for conduct that we believe violates these Terms or is harmful to other users of the Service, us, or third parties,
                        or for any other reason.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">5. Limitation of Liability</h2>
                    <p className="text-text-secondary leading-relaxed">
                        Stash is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use
                        of the Service, including data loss or service interruptions.
                    </p>
                </section>

                <div className="pt-8 border-t border-border">
                    <p className="text-sm text-text-muted">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
