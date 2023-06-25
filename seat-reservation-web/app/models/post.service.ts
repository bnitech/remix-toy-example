import supabase from './supabase';

export type TPostTitleOnly = {
  id: number;
  title: string | null;
};

export type TPost = {
  id: number;
  title: string | null;
  content: string | null;
  board_id: number;
};

export async function getPostByBoardId(board_id: number) {
  return supabase
    .from('post')
    .select(`id, title, content, board_id`)
    .eq('board_id', board_id);
}

export async function getPostTitleByBoardId(board_id: number) {
  return supabase.from('post').select(`id, title`).eq('board_id', board_id);
}

export async function getPost(id: number) {
  return supabase
    .from('post')
    .select(`id, title, content, board_id`)
    .eq('id', id)
    .limit(1)
    .single();
}

export async function createPost(
  title: string,
  content: string,
  board_id: number,
) {
  return supabase.from('post').insert({ title, content, board_id });
}

export async function updatePost(
  id: number,
  title: string,
  content: string,
  board_id: number,
) {
  return supabase
    .from('post')
    .update({ title, content, board_id })
    .eq('id', id);
}

export async function deletePost(id: number) {
  return supabase.from('post').delete().eq('id', id);
}