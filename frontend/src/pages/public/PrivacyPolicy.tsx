import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Lock, Database, Globe, Users, BarChart3 } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-primary mr-2" />
                        <span className="text-2xl font-bold">FairScore</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Last updated: November 4, 2026
                    </p>
                </div>

                {/* Introduction */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        At FairScore, we respect your privacy and are committed to protecting your personal data.
                        This Privacy Policy describes how we collect, use, and safeguard your information when you
                        use our platform, whether as a borrower or lender.
                    </p>
                </section>

                {/* Information We Collect */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Database className="h-6 w-6 mr-2 text-primary" />
                        Information We Collect
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p><strong>Personal Information:</strong> Name, email, phone number, address, and identification documents.</p>
                        <p><strong>Financial Information:</strong> Income details, bank account information, credit history, and other financial data.</p>
                        <p><strong>Device Information:</strong> IP address, browser type, operating system, and usage patterns.</p>
                        <p><strong>Communication Data:</strong> Messages and interactions within the platform.</p>
                    </div>
                </section>

                {/* How We Use Your Information */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <BarChart3 className="h-6 w-6 mr-2 text-secondary" />
                        How We Use Your Information
                    </h2>
                    <div className="space-y-3 text-muted-foreground">
                        <p>We use your information to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Generate fair and transparent credit scores</li>
                            <li>Match you with appropriate lenders or borrowers</li>
                            <li>Process loan applications and payments</li>
                            <li>Provide personalized recommendations</li>
                            <li>Ensure platform security and prevent fraud</li>
                            <li>Send transactional and promotional communications</li>
                            <li>Comply with legal and regulatory requirements</li>
                        </ul>
                    </div>
                </section>

                {/* Data Sharing */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Users className="h-6 w-6 mr-2 text-tertiary" />
                        Information Sharing
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>We may share your information with:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Lenders (for borrowers):</strong> To facilitate loan applications and approvals</li>
                            <li><strong>Borrowers (for lenders):</strong> To review qualified loan applications</li>
                            <li><strong>Service Providers:</strong> Third-party vendors who help operate our platform</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                        </ul>
                        <p className="font-semibold text-foreground">We do not sell your personal data to third parties for marketing purposes.</p>
                    </div>
                </section>

                {/* Security */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Lock className="h-6 w-6 mr-2 text-primary" />
                        Data Security
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>We implement robust security measures to protect your information:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>End-to-end encryption for data transmission</li>
                            <li>Secure cloud storage with regular security audits</li>
                            <li>Access controls and authentication protocols</li>
                            <li>Regular vulnerability assessments and penetration testing</li>
                            <li>Incident response procedures for data breaches</li>
                        </ul>
                    </div>
                </section>

                {/* Your Rights */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Access and review your personal data</li>
                            <li>Correct inaccurate information</li>
                            <li>Delete your data (subject to legal requirements)</li>
                            <li>Object to processing for marketing purposes</li>
                            <li>Data portability - receive your data in a structured format</li>
                            <li>Lodge a complaint with data protection authorities</li>
                        </ul>
                    </div>
                </section>

                {/* International Transfers */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <Globe className="h-6 w-6 mr-2 text-secondary" />
                        International Data Transfers
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>Your information may be transferred to and processed in countries outside
                        your own. We ensure appropriate safeguards are in place, including:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Standard contractual clauses approved by regulatory authorities</li>
                            <li>Adequacy decisions where applicable</li>
                            <li>Encryption and security measures for data in transit</li>
                        </ul>
                    </div>
                </section>

                {/* Children's Privacy */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
                    <p className="text-muted-foreground">
                        Our services are not intended for individuals under 18 years of age. We do not
                        knowingly collect personal information from children. If we become aware of such
                        collection, we will promptly delete the information.
                    </p>
                </section>

                {/* Changes to Policy */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                    <p className="text-muted-foreground">
                        We may update our Privacy Policy from time to time. We will notify you of any
                        changes by posting the new Privacy Policy on this page and updating the
                        "Last Updated" date. We encourage you to review this policy periodically.
                    </p>
                </section>

                {/* Contact */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="text-muted-foreground">
                        If you have any questions about this Privacy Policy or your data rights, please
                        contact us at:
                    </p>
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <p className="font-semibold text-foreground">FairScore Privacy Team</p>
                        <p className="text-muted-foreground">Email: privacy@fairscore.example.com</p>
                        <p className="text-muted-foreground">Address: FairScore Financial Technologies Pvt. Ltd., India</p>
                    </div>
                </section>

                {/* Acceptance */}
                <section className="pt-8 border-t">
                    <div className="text-center text-muted-foreground">
                        <p>By using FairScore, you acknowledge that you have read and understood our
                        Privacy Policy and agree to the collection and use of your information as
                        described herein.</p>
                        <Link to="/" className="inline-block mt-4">
                            <Button variant="outline">Return to Home</Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;