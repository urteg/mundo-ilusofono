/** Vídeo bloqueado leva aos planos; os outros, ao player. */
export function hrefDoVideo(v: { id: string; bloqueado: boolean }) {
  return v.bloqueado ? "/app/planos" : `/app/video/${v.id}`;
}
