import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useWebsites = (categoryId?: string) => {
  return useQuery({
    queryKey: ["websites", categoryId],
    queryFn: async () => {
      let query = supabase
        .from("websites")
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order("created_at", { ascending: false });

      if (categoryId && categoryId !== "all") {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useWebsite = (id: string) => {
  return useQuery({
    queryKey: ["website", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("websites")
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
