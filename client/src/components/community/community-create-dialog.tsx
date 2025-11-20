import { memo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Users } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Spinner } from "../ui/spinner";
import { Label } from "../ui/label";

interface CommunityCreateDialogProps {
  onCreateCommunity: (data: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => Promise<any>;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const CommunityCreateDialog = memo(
  ({ onCreateCommunity, isLoading = false, children }: CommunityCreateDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [communityName, setCommunityName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const resetState = () => {
      setCommunityName("");
      setDescription("");
      setIsPublic(true);
    };

    const handleCreateCommunity = async () => {
      if (!communityName.trim()) return;
      try {
        await onCreateCommunity({
          name: communityName,
          description: description || undefined,
          isPublic,
        });
        setIsOpen(false);
        resetState();
      } catch (error) {
        console.error("Failed to create community:", error);
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
              title="Create Community"
            >
              <Users className="!h-5 !w-5 !stroke-1" />
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 z-[999] rounded-xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Create Community</h3>
              <p className="text-sm text-muted-foreground">
                Create a community to organize your groups and channels
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="community-name">Community Name</Label>
              <InputGroup>
                <InputGroupInput
                  id="community-name"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  placeholder="Enter community name"
                  disabled={isLoading}
                />
                <InputGroupAddon>
                  <Users size={16} />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="community-description">Description</Label>
              <Textarea
                id="community-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional: Describe your community"
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
                Make community public
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
                onClick={handleCreateCommunity}
                disabled={isLoading || !communityName.trim()}
              >
                {isLoading && <Spinner className="w-4 h-4" />}
                Create Community
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
CommunityCreateDialog.displayName = "CommunityCreateDialog";
