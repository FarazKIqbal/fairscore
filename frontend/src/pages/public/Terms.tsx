import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Gavel, Users, CreditCard, AlertCircle } from 'lucide-react';

const Terms = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center mb-4">
                        <Gavel className="h-8 w-8 text-primary mr-2" />
                        <span className="text-2xl font-bold">FairScore</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Last updated: November 4, 2026
                    </p>
                </div>

                {/* Introduction */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        These Terms of Service ("Terms") govern your access to and use of FairScore's
                        platform, website, and mobile applications (collectively, the "Service").
                        By accessing or using the Service, you agree to be bound by these Terms.
                    </p>
                </section>

                {/* Eligibility */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Eligibility</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>By using FairScore, you represent and warrant that:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>You are at least 18 years old or have reached majority age in your jurisdiction</li>
                            <li>You have the legal capacity to enter into a binding contract</li>
                            <li>You are not currently or have not been barred from using the Service</li>
                            <li>All information provided is true, accurate, and complete</li>
                        </ul>
                    </div>
                </section>

                {/* Account Registration */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Account Registration</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>When creating an account, you must:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Provide accurate, current, and complete personal information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Immediately notify us of any unauthorized use</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>
                    </div>
                </section>

                {/* Borrower Terms */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Borrower Terms</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>When applying for loans through FairScore:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Your credit score information is generated for informational purposes only</li>
                            <li>Lending decisions are made solely by the lender, not FairScore</li>
                            <li>You must fulfill all loan terms agreed upon with lenders</li>
                            <li>Defaulting on a loan may affect your ability to use the Service</li>
                            <li>All loan amounts, interest rates, and terms are determined by lenders</li>
                        </ul>
                    </div>
                </section>

                {/* Lender Terms */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Lender Terms</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>When lending through FairScore:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>You are solely responsible for loan approval decisions</li>
                            <li>You must comply with all applicable lending regulations</li>
                            <li>Loan disbursement and repayment terms are set by the lender</li>
                            <li>You indemnify FairScore for any lending-related claims</li>
                            <li>Maintain adequate lending capacity and capital reserves</li>
                        </ul>
                    </div>
                </section>

                {/* Payment Terms */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <CreditCard className="h-6 w-6 mr-2 text-tertiary" />
                        Payments and Fees
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>FairScore's payment structure:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Platform Fees:</strong> A small fee is charged on successful loan transactions</li>
                            <li><strong>No Upfront Costs:</strong> Creating an account and applying is free</li>
                            <li><strong>Transparent Pricing:</strong> All fees are disclosed before any transaction</li>
                            <li><strong>Payment Processing:</strong> Third-party processors handle all payments</li>
                        </ul>
                    </div>
                </section>

                {/* Intellectual Property */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>FairScore retains all rights to its technology, branding, and platform features.
                        You retain rights to content you create and share.</p>
                        <p>You grant FairScore a license to use, reproduce, and display content you submit
                        for the purpose of providing the Service.</p>
                    </div>
                </section>

                {/* User Content */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">User Content</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>You are responsible for all content you submit to the platform:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Content must be accurate and not misleading</li>
                            <li>Do not submit false information to obtain loans</li>
                            <li>Report any suspicious activity immediately</li>
                            <li>Content may be removed for violations of these Terms</li>
                        </ul>
                    </div>
                </section>

                {/* Dispute Resolution */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Dispute Resolution</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>Any disputes arising from these Terms or the Service shall be resolved as follows:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Negotiation:</strong> Attempt resolution through direct communication</li>
                            <li><strong>Mediation:</strong> If unresolved, mediation through recognized services</li>
                            <li><strong>Governing Law:</strong> Indian law shall govern these Terms</li>
                        </ul>
                    </div>
                </section>

                {/* Limitation of Liability */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <AlertCircle className="h-6 w-6 mr-2 text-destructive" />
                        Limitation of Liability
                    </h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p className="font-semibold text-foreground">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>FairScore is not liable for lending decisions made by lenders</li>
                            <li>Loss of funds due to borrower default is not our responsibility</li>
                            <li>We are not liable for indirect, incidental, or consequential damages</li>
                            <li>Our total liability is limited to amounts paid to us under these Terms</li>
                        </ul>
                    </div>
                </section>

                {/* Termination */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Account Termination</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>We may terminate or suspend your account for:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Violation of these Terms</li>
                            <li>Fraudulent or illegal activity</li>
                            <li>Prolonged inactivity</li>
                            <li>Technical issues or platform discontinuation</li>
                        </ul>
                        <p>Upon termination, your access to non-financial features will cease immediately.
                        Outstanding loan obligations must be fulfilled.</p>
                    </div>
                </section>

                {/* Contact Information */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>For questions about these Terms, please contact:</p>
                        <div className="p-4 bg-muted/30 rounded-lg">
                            <p className="font-semibold text-foreground">FairScore Legal Department</p>
                            <p>Email: legal@fairscore.example.com</p>
                            <p>Address: FairScore Financial Technologies Pvt. Ltd., India</p>
                        </div>
                    </div>
                </section>

                {/* Acceptance */}
                <section className="pt-8 border-t">
                    <div className="text-center text-muted-foreground">
                        <p>By using FairScore, you acknowledge that you have read and understood these Terms
                        of Service and agree to be bound by them.</p>
                        <Link to="/" className="inline-block mt-4">
                            <Button variant="outline">Return to Home</Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Terms;