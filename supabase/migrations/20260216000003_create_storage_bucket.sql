-- 이미지 저장 버킷 생성
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'analysis-images',
  'analysis-images',
  true,
  10485760,  -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- 업로드 정책
create policy "service_role_upload" on storage.objects
  for insert
  with check (bucket_id = 'analysis-images');

-- 공개 읽기 정책
create policy "public_read" on storage.objects
  for select
  using (bucket_id = 'analysis-images');
