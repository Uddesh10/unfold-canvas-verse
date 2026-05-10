import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Download, Upload, ExternalLink } from "lucide-react";
import { signOutAdmin } from "@/lib/adminAuth";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { PhotographerEditor } from "@/components/admin/PhotographerEditor";
import { FaqEditor } from "@/components/admin/FaqEditor";
import { SubmissionsViewer } from "@/components/admin/SubmissionsViewer";
import { TestimonialsEditor } from "@/components/admin/TestimonialsEditor";
import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";
import { ShowcaseEditor } from "@/components/admin/ShowcaseEditor";
import { Seo } from "@/components/Seo";
import { useRef } from "react";
import { toast } from "@/components/ui/use-toast";

const STORAGE_KEYS = [
  "unfold:gallery:weddings",
  "unfold:gallery:spaces",
  "unfold:gallery:stories",
  "unfold:photographer",
  "unfold:faqs",
  "unfold:submissions",
  "unfold:testimonials:weddings",
  "unfold:hero-slides",
  "unfold:showcase",
];

const Admin = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const logout = () => {
    signOutAdmin();
    navigate("/admin/login", { replace: true });
  };

  const exportAll = () => {
    const data: Record<string, unknown> = {};
    for (const k of STORAGE_KEYS) {
      const v = localStorage.getItem(k);
      if (v) data[k] = JSON.parse(v);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unfold-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAll = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      for (const k of STORAGE_KEYS) {
        if (data[k] !== undefined) {
          localStorage.setItem(k, JSON.stringify(data[k]));
        }
      }
      window.dispatchEvent(new StorageEvent("storage"));
      toast({ title: "Imported. Reload pages to see changes." });
      setTimeout(() => window.location.reload(), 600);
    } catch {
      toast({ title: "Invalid file", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Admin — Unfold Studios" description="Manage galleries and photographer info" path="/admin" />
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-display tracking-[0.25em] uppercase">
              Unfold
            </Link>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" /> View site
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={exportAll}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])}
            />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <h1 className="font-display text-4xl mb-2">Content manager</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Edit photos for each studio and update photographer info. Saved to this browser only.
        </p>

        <Tabs defaultValue="hero">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="showcase">Studios</TabsTrigger>
            <TabsTrigger value="weddings">Weddings</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="spaces">Spaces</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="photographer">Photographer</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="hero" className="mt-6">
            <HeroSlidesEditor />
          </TabsContent>
          <TabsContent value="showcase" className="mt-6">
            <ShowcaseEditor />
          </TabsContent>
          <TabsContent value="weddings" className="mt-6">
            <GalleryEditor vertical="weddings" />
          </TabsContent>
          <TabsContent value="testimonials" className="mt-6">
            <TestimonialsEditor />
          </TabsContent>
          <TabsContent value="spaces" className="mt-6">
            <GalleryEditor vertical="spaces" />
          </TabsContent>
          <TabsContent value="stories" className="mt-6">
            <GalleryEditor vertical="stories" />
          </TabsContent>
          <TabsContent value="photographer" className="mt-6">
            <PhotographerEditor />
          </TabsContent>
          <TabsContent value="faq" className="mt-6">
            <FaqEditor />
          </TabsContent>
          <TabsContent value="submissions" className="mt-6">
            <SubmissionsViewer />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
