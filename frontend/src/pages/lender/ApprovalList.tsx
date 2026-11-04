import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { authService, ApprovedBorrower, LenderReviewInsights, ShapExplanation } from '@/services/authService';
import { CheckCircle, Eye, ShieldCheck, Sparkles, AlertTriangle, User, IndianRupee } from 'lucide-react';

const riskBadge = (risk: string) => {
    const r = risk.toLowerCase();
    if (r === 'low') return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
    if (r === 'medium') return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
};

const formatTenure = (yr: number, mon: number) => {
    const parts: string[] = [];
    if (yr > 0) parts.push(`${yr} yr${yr > 1 ? 's' : ''}`);
    if (mon > 0) parts.push(`${mon} mo${mon > 1 ? 's' : ''}`);
    return parts.join(' ') || '—';
};

const ApprovalList = () => {
    const { user } = useAuth();
    const [borrowers, setBorrowers] = useState<ApprovedBorrower[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState<ApprovedBorrower | null>(null);
    const [reviewInsights, setReviewInsights] = useState<LenderReviewInsights | null>(null);
    const [shapExplanation, setShapExplanation] = useState<ShapExplanation | null>(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [insightsError, setInsightsError] = useState('');

    useEffect(() => {
        const fetchApproved = async () => {
            if (!user?.id) return;
            try {
                const data = await authService.getApprovedBorrowers(user.id);
                setBorrowers(data);
            } catch {
                setError('Failed to load approved borrowers.');
            } finally {
                setLoading(false);
            }
        };
        fetchApproved();
    }, [user?.id]);

    // Load insights when borrower selection changes
    useEffect(() => {
        if (!selected?.userid) {
            setReviewInsights(null);
            setShapExplanation(null);
            setInsightsError('');
            return;
        }
        if (!user?.id) return;

        setLoadingInsights(true);
        setInsightsError('');

        authService.getLenderReviewInsights(user.id, selected.userid)
            .then((data) => {
                setReviewInsights(data);
                // Extract SHAP from the response if available
                if (data.shap) {
                    setShapExplanation(data.shap);
                }
            })
            .catch(err => setInsightsError('Failed to load review insights'))
            .finally(() => setLoadingInsights(false));
    }, [selected?.userid, user?.id]);

    return (
        <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Approval List</h2>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Approved Borrowers ({borrowers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : borrowers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No approved borrowers yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-center">Credit Score</TableHead>
                                        <TableHead className="text-center">Risk</TableHead>
                                        <TableHead className="text-right">Income (₹)</TableHead>
                                        <TableHead className="text-right">Loan Amount (₹)</TableHead>
                                        <TableHead className="text-center">Tenure</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {borrowers.map((b) => (
                                        <TableRow key={b.userid}>
                                            <TableCell className="font-medium">{b.name}</TableCell>
                                            <TableCell className="text-center">{b.creditScore}</TableCell>
                                            <TableCell className="text-center">{riskBadge(b.risk)}</TableCell>
                                            <TableCell className="text-right">₹{b.income.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-right">₹{b.loanAmount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell className="text-center">{formatTenure(b.loanTenureYr, b.loanTenureMon)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => setSelected(b)}>
                                                    <Eye className="h-4 w-4 mr-1" /> Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
                <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Borrower Details</DialogTitle>
                        <DialogDescription>Review the borrower's profile and score insights.</DialogDescription>
                    </DialogHeader>
                    {selected && (
                        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto py-4 pr-1 text-sm">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-semibold">{selected.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Credit Score</p>
                                        <p className={`font-semibold text-lg ${selected.creditScore >= 750 ? 'text-green-600' : selected.creditScore >= 600 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {selected.creditScore}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Risk Level</p>
                                        <div>{riskBadge(selected.risk)}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <IndianRupee className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Loan Amount</p>
                                        <p className="font-semibold">₹{selected.loanAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Score & Risk Explanation */}
                            <div className="rounded-lg border p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        Score & Risk Explanation
                                    </h4>
                                    {loadingInsights && <span className="text-xs text-muted-foreground">Loading analysis...</span>}
                                </div>

                                <div className="space-y-3">
                                    <h5 className="text-sm font-medium">Top Credit Factors</h5>
                                    {loadingInsights && !shapExplanation ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-8 w-full" />
                                            ))}
                                        </div>
                                    ) : insightsError ? (
                                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 mt-0.5" />
                                            <span>{insightsError}</span>
                                        </div>
                                    ) : shapExplanation?.topFactors?.length ? (
                                        <div className="space-y-2">
                                            {shapExplanation.topFactors.slice(0, 5).map((factor, idx, arr) => {
                                                const maxImpact = Math.max(...arr.map((f) => Math.abs(f.impact)), 1);
                                                const width = Math.max(8, (Math.abs(factor.impact) / maxImpact) * 100);
                                                const positive = factor.direction === 'helps';

                                                return (
                                                    <div key={`${factor.feature}-${idx}`} className="space-y-1">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="font-medium text-xs sm:text-sm">{factor.feature}</span>
                                                            <span className={`text-xs font-medium ${positive ? 'text-green-700' : 'text-red-700'}`}>
                                                                {positive ? 'Helps score' : 'Hurts score'}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 rounded bg-muted overflow-hidden">
                                                            <div
                                                                className={`h-full ${positive ? 'bg-green-500' : 'bg-red-500'}`}
                                                                style={{ width: `${width}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Average impact: {Math.abs(factor.impact).toFixed(2)}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No factor analysis available.</p>
                                    )}
                                </div>

                                {/* AI Recommendation */}
                                <div className="space-y-2">
                                    <h5 className="text-sm font-medium flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        AI Recommendation
                                    </h5>
                                    {loadingInsights && !reviewInsights?.advice ? (
                                        <Skeleton className="h-16 w-full" />
                                    ) : insightsError ? (
                                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 mt-0.5" />
                                            <span>{insightsError}</span>
                                        </div>
                                    ) : reviewInsights?.advice ? (
                                        <div className="rounded-md bg-muted/50 p-3 space-y-2">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{reviewInsights.advice.advice}</p>
                                            {reviewInsights.advice.improvementTips?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Decision Tips</p>
                                                    <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                                                        {reviewInsights.advice.improvementTips.slice(0, 4).map((tip, idx) => (
                                                            <li key={idx}>{tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No AI recommendation available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ApprovalList;