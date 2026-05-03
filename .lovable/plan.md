
## Мәселе

Pro пайдаланушыға лимит біткен кезде "Pro сатып алу" диалогы көрсетіліп тұр. Бұл екі себептен болуы мүмкін:

1. **Timing мәселесі**: `useProStatus` жүктеліп жатқанда `isPro` = `false`, бірақ usage query тезірек аяқталып, диалог ашылады.
2. **Бірнеше жерде** диалог ашылады — барлығында `isPro` тексеру бар, бірақ `loading` күйі ескерілмейді.

## Жоспар

**src/hooks/use-pro-status.ts** — өзгеріс жоқ (loading қазір қайтарылып тұр).

**src/pages/ChatPage.tsx** — 3 өзгеріс:

1. `useProStatus()` шақыруынан `loading` күйін де алу: `const { isPro, loading: proLoading } = useProStatus();`

2. Лимит диалогын ашатын барлық 3 жерде `proLoading` тексеру қосу:
   - Line 111: `if (!isPro && !proLoading && remainingQuestions === 0 && !limitDialogShown)`
   - Line 158: `if (!isPro && !proLoading && usage.remaining === 0)`
   - Line 168-171: error handler ішіндегі `setProDialogOpen(true)` шақыруын да `!isPro && !proLoading` тексерумен қоршау

3. useEffect dependency-ге `proLoading` қосу (line 115).

Бұл өзгерістер Pro пайдаланушыға ешқашан "лимит бітті" диалогын көрсетпейді.
