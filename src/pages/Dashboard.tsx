import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Copy,
  Facebook,
  Twitter,
  Instagram,
  Users,
  BarChart,
} from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserButton } from "@/components/UserButton";
import { useQuery } from "@tanstack/react-query";
import { fetchUserStats } from "@/lib/stats";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { toast } = useToast();
  const referralLink = "ref.referralpro.com/user123"; // This should be dynamic based on user's referral code

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return fetchUserStats(user.id);
    }
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('earnings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'earnings'
        },
        async (payload) => {
          console.log('Realtime update received:', payload);
          // Refetch stats when earnings change
          await refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1">
          <header className="flex justify-end p-4 bg-white border-b">
            <UserButton />
          </header>
          <main className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <Card className="bg-primary text-white p-6 mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Total Earnings</h2>
                <span className="text-3xl font-bold">${stats?.earnings.toFixed(2) || '0.00'}</span>
              </div>
            </Card>

            <div className="text-center mb-8">
              <p className="text-lg text-gray-600">
                You have {stats?.clicks || 0} Click{stats?.clicks !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="w-6 h-6 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Referrals</h3>
                </div>
                <p className="text-3xl font-bold">{stats?.referrals || 0}</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center mb-4">
                  <BarChart className="w-6 h-6 text-primary mr-2" />
                  <h3 className="text-lg font-semibold">Offers</h3>
                </div>
                <p className="text-3xl font-bold">{stats?.offers || 0}</p>
              </Card>
            </div>

            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                Copy Your Referral Link 👇
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 p-2 border rounded-md bg-gray-50"
                />
                <Button onClick={copyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Share on Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90"
                  onClick={() => window.open("https://facebook.com", "_blank")}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </Button>
                <Button
                  className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90"
                  onClick={() => window.open("https://twitter.com", "_blank")}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button
                  className="bg-[#E4405F] hover:bg-[#E4405F]/90"
                  onClick={() => window.open("https://instagram.com", "_blank")}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Share on Instagram
                </Button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;