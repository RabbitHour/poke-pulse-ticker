-- 1. Lock down sales_* tables to service-role only reads
DROP POLICY IF EXISTS "Authenticated read sales_leads" ON public.sales_leads;
DROP POLICY IF EXISTS "Authenticated read sales_outreach_log" ON public.sales_outreach_log;
DROP POLICY IF EXISTS "Authenticated read sales_pipeline_metrics" ON public.sales_pipeline_metrics;

CREATE POLICY "Service role manages sales_leads"
  ON public.sales_leads FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role manages sales_outreach_log"
  ON public.sales_outreach_log FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role manages sales_pipeline_metrics"
  ON public.sales_pipeline_metrics FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 2. Owner-scoped DELETE policy on investor-assets bucket
CREATE POLICY "Users delete own investor-assets files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'investor-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );