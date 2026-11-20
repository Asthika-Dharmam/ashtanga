# Turns an Ashtanga sankalpa ICS (two events a day) into {date: text} for tools/check_ashtanga.mjs.
import sys, json, re
raw = open(sys.argv[1], encoding='utf-8').read().replace('\r\n','\n')
raw = re.sub(r'\n ', '', raw)
out = {}
MON = {m:i+1 for i,m in enumerate('January February March April May June July August September October November December'.split())}
for ev in raw.split('BEGIN:VEVENT')[1:]:
    s = re.search(r'SUMMARY:(\d+)-(\w+)-(\d+) .*\[(\d)/2\]', ev)
    d = re.search(r'DESCRIPTION:(.*)', ev).group(1)
    key = '%s-%02d-%s' % (s.group(3), MON[s.group(2)], s.group(1))
    out.setdefault(key, ['', ''])[int(s.group(4))-1] = d.replace(r'\;', ';').replace(r'\,', ',')
json.dump({k: v[0] + v[1] for k, v in out.items()}, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
