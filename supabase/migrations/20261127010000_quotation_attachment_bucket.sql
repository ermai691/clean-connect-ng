-- Private bucket for quotation photos. Customers can write only inside their own folder.
insert into storage.buckets (id, name, public)
values ('quotation-attachments', 'quotation-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Customers upload own quote photos" on storage.objects;
create policy "Customers upload own quote photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'quotation-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Customers read own quote photos" on storage.objects;
create policy "Customers read own quote photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'quotation-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins read quote photos" on storage.objects;
create policy "Admins read quote photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'quotation-attachments'
    and public.has_role(auth.uid(), 'admin')
  );
