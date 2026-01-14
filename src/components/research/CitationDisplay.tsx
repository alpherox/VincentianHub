import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Quote } from 'lucide-react';

interface CitationDisplayProps {
  apa: string;
  mla: string;
}

export function CitationDisplay({ apa, mla }: CitationDisplayProps) {
  const [copiedFormat, setCopiedFormat] = useState<'apa' | 'mla' | null>(null);
  const { toast } = useToast();

  const handleCopy = async (text: string, format: 'apa' | 'mla') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      toast({
        title: 'Citation Copied!',
        description: `${format.toUpperCase()} citation copied to clipboard.`,
      });
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Please select and copy the text manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Quote className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">Cite This Research</h3>
      </div>
      
      <Tabs defaultValue="apa" className="p-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="apa">APA 7th</TabsTrigger>
          <TabsTrigger value="mla">MLA 9th</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apa" className="space-y-3">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm leading-relaxed text-primary font-medium">
              {apa}
            </p>
          </div>
          <Button
            variant="accent"
            size="sm"
            className="w-full gap-2"
            onClick={() => handleCopy(apa, 'apa')}
          >
            {copiedFormat === 'apa' ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy APA Citation
              </>
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="mla" className="space-y-3">
          <div className="rounded-lg bg-secondary/50 p-4">
            <p className="text-sm leading-relaxed text-primary font-medium">
              {mla}
            </p>
          </div>
          <Button
            variant="accent"
            size="sm"
            className="w-full gap-2"
            onClick={() => handleCopy(mla, 'mla')}
          >
            {copiedFormat === 'mla' ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy MLA Citation
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
