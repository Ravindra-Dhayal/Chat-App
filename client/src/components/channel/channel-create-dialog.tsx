import { memo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Megaphone } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Spinner } from "../ui/spinner";
import { Label } from "../ui/label";

interface ChannelCreateDialogProps {
  onCreateChannel: (data: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => Promise<any>;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ChannelCreateDialog = memo(
  ({ onCreateChannel, isLoading = false, children }: ChannelCreateDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const resetState = () => {
      setChannelName("");
      setDescription("");
      setIsPublic(true);
    };

    const handleCreateChannel = async () => {
      if (!channelName.trim()) return;
      try {
        await onCreateChannel({
          name: channelName,
          description: description || undefined,
          isPublic,
        });
        setIsOpen(false);
        resetState();
      } catch (error) {
        console.error("Failed to create channel:", error);
      }
    };

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if (!open) resetState();
    };

    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {children ? (
            <div onClick={() => setIsOpen(true)}>{children}</div>
          ) : (
            <Button
              onClick={() => setIsOpen(true)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Create Channel"
            >
              <Megaphone className="!h-5 !w-5 !stroke-1" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 z-[999] rounded-xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Create Channel</h3>
              <p className="text-sm text-muted-foreground">
                Start a broadcast channel for your followers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <InputGroup>
                <InputGroupInput
                  id="channel-name"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Enter channel name"
                  disabled={isLoading}
                />
                <InputGroupAddon>
                  <Megaphone size={16} />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-description">Description</Label>
              <Textarea
                id="channel-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional: Describe your channel"
                disabled={isLoading}
                className="resize-none h-24"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is-public"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="is-public" className="cursor-pointer">
                Make channel public
              </Label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                disabled={isLoading || !channelName.trim()}
              >
                {isLoading && <Spinner className="w-4 h-4" />}
                Create Channel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
ChannelCreateDialog.displayName = "ChannelCreateDialog";
