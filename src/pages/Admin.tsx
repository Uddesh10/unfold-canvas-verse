import { useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink } from "lucide-react";
import { signOut } from "@/lib/adminAuth";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { PhotographerEditor } from "@/components/admin/PhotographerEditor";
import { FaqEditor } from "@/components/admin/FaqEditor";
import { SubmissionsViewer } from "@/components/admin/SubmissionsViewer";
import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";
import { TestimonialsEditor } from "@/components/admin/TestimonialsEditor";

import { Seo } from "@/components/Seo";


const Admin = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Admin — Unfold Studios" description="Manage galleries and photographer info" path="/admin" />
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-display tracking-[0.25em] uppercase">Unfold</Link>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" /> View site
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <h1 className="font-display text-4xl mb-2">Content manager</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Make your edits, then hit <strong>Save changes</strong> at the top of each section to push them live.
        </p>

        <Tabs defaultValue="hero">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="weddings">Weddings</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="spaces">Spaces</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="photographer">Photographer</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="hero" className="mt-6"><HeroSlidesEditor /></TabsContent>
          <TabsContent value="weddings" className="mt-6"><GalleryEditor vertical="weddings" /></TabsContent>
          <TabsContent value="testimonials" className="mt-6"><TestimonialsEditor /></TabsContent>
          <TabsContent value="spaces" className="mt-6"><GalleryEditor vertical="spaces" /></TabsContent>
          <TabsContent value="stories" className="mt-6"><GalleryEditor vertical="stories" /></TabsContent>
          <TabsContent value="photographer" className="mt-6"><PhotographerEditor /></TabsContent>
          <TabsContent value="faq" className="mt-6"><FaqEditor /></TabsContent>
          <TabsContent value="submissions" className="mt-6"><SubmissionsViewer /></TabsContent>

        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
