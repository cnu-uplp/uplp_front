import GlassCard from "@/components/GlassCard";
import EditableSections from "@/components/EditableSections";
import ClubInfo from "@/components/ClubInfo";

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col pb-8 pt-24">
      <GlassCard>
        <div className="mx-auto w-full max-w-4xl px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-sky-900">
              동아리 소개
            </h1>
            <p className="mt-4 text-slate-600">
              UPLP 수영 동아리는 누구나 환영하는 열린 수영 커뮤니티입니다.
            </p>

            <div className="mt-10 flex justify-center">
              <img
                src="/pool.png"
                alt="충남대 실내 수영장"
                className="h-auto max-w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>

          {/* 활동 시간·장소 같은 기본 정보. 홈 첫 화면과 같은 목록을 읽으므로
              여기서 한 번 고치면 두 화면이 같이 바뀐다. 편집 UI도 여기에만 둔다. */}
          <div className="mt-12">
            <ClubInfo variant="cards" />
          </div>

          {/* 자유 서술 섹션 — 임원진이 마크다운으로 쓴다 */}
          <div className="mt-12">
            <EditableSections page="about" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
