import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { API } from "@/lib/axios-client";
import { toast } from "sonner";
import { Megaphone, Check, AlertCircle, Users, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTheme } from "@/components/theme-provider";

interface ChannelInviteInfo {
  _id: string;
  groupName: string;
  channelDescription?: string;
  subscriberCount: number;
  participants: any[];
}

interface ChannelInviteDialogProps {
  channelId: string;
  onClose: () => void;
}

const ChannelInviteDialog = ({ channelId, onClose }: ChannelInviteDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [channelInfo, setChannelInfo] = useState<ChannelInviteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    if (!channelId) return;
    fetchChannelInfo();
  }, [channelId]);

  const fetchChannelInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/channel/${channelId}/info`);
      setChannelInfo(data.channel);
      
      // Check if user is already subscribed
      const isSubscribed = data.channel.participants?.some(
        (p: any) => p._id === user?._id || p === user?._id
      );
      setAlreadySubscribed(isSubscribed);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to load channel information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!channelId || !user) return;

    setIsSubscribing(true);
    try {
      await API.post(`/channel/${channelId}/subscribe`);
      toast.success("Successfully subscribed to the channel!");
      navigate(`/channel/${channelId}`);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleOpenChannel = () => {
    navigate(`/channel/${channelId}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div
          className={`rounded-xl shadow-lg w-full max-w-md
            ${theme === "dark" ? "bg-slate-800" : "bg-white"}
            flex flex-col`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Spinner className="w-11 h-11 !text-primary" />
            </div>
          ) : error || !channelInfo ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invalid Invite</h2>
              <p className="text-muted-foreground mb-4">
                {error || "This channel doesn't exist or the invite link is invalid"}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 text-center border-b">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Megaphone className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{channelInfo.groupName}</h2>
                {channelInfo.channelDescription && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {channelInfo.channelDescription}
                  </p>
                )}
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                  <Users className="h-4 w-4" />
                  <span>{channelInfo.subscriberCount || 0} subscribers</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {alreadySubscribed ? (
                  <>
                    <div className="flex items-center justify-center gap-2 text-green-500 mb-4">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">You're already subscribed</span>
                    </div>
                    <button
                      onClick={handleOpenChannel}
                      className="w-full py-3 px-4 rounded-lg font-medium bg-primary text-white hover:opacity-90 transition-all"
                    >
                      Open Channel
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-center text-muted-foreground mb-6">
                      You've been invited to subscribe to this channel. Click the button below to subscribe.
                    </p>
                    <button
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                      className="w-full py-3 px-4 rounded-lg font-medium bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubscribing ? "Subscribing..." : "Subscribe"}
                    </button>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t">
                <button
                  onClick={onClose}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-black"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ChannelInviteDialog;
