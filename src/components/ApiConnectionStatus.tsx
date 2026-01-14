import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, Settings, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { f1ApiService, ConnectionStatus } from "@/services/f1ApiService";

export function ApiConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(f1ApiService.getConnectionStatus());
  const [apiUrl, setApiUrl] = useState(f1ApiService.getApiUrl());
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    return f1ApiService.onStatusChange(setStatus);
  }, []);

  const handleReconnect = () => {
    f1ApiService.checkConnection();
  };

  const handleUpdateUrl = () => {
    f1ApiService.setApiUrl(apiUrl);
    setDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          status.checking
            ? "bg-yellow-500/20 text-yellow-400"
            : status.connected
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {status.checking ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : status.connected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>API Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Disconnected</span>
          </>
        )}
      </motion.div>

      {/* Reconnect Button */}
      {!status.connected && !status.checking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReconnect}
          className="h-7 px-2"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}

      {/* Settings Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2">
            <Settings className="w-3 h-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-racing">API Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Python Backend URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="flex-1"
                />
                <Button onClick={handleUpdateUrl}>Connect</Button>
              </div>
            </div>

            {status.error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{status.error}</p>
              </div>
            )}

            {status.connected && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Model Status</h4>
                <div className="grid gap-2">
                  <ModelStatusRow name="Historical Model" available={status.models.historical} />
                  <ModelStatusRow name="Telemetry Model" available={status.models.telemetry} />
                  <ModelStatusRow name="Hybrid Oracle" available={status.models.hybrid} />
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <h4 className="text-sm font-medium mb-2">Deploy Instructions</h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Copy <code className="bg-background px-1 rounded">python-backend/</code> folder</li>
                <li>Place your model files in the folder</li>
                <li>Run: <code className="bg-background px-1 rounded">uvicorn main:app --host 0.0.0.0 --port 8000</code></li>
                <li>Enter the URL above and click Connect</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModelStatusRow({ name, available }: { name: string; available: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/30">
      <span className="text-sm">{name}</span>
      {available ? (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <CheckCircle2 className="w-3 h-3" /> Ready
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <XCircle className="w-3 h-3" /> Not loaded
        </span>
      )}
    </div>
  );
}
